import LobbyResourceManager from "../lobby/main/view-models/LobbyResourceManager";
import { RemoteSharedResourceConfig } from "../lobby/main/view-models/theme/SkeletonBannerTheme";
import { SkeletonCache } from "../managers/GameUIManager";
import GameUtils from "./GameUtils";

const { ccclass, property } = cc._decorator;

enum SpineFile {
    Atlas = 0,
    Json = 1,
    Texture = 2
}

export enum Type {
    Icon = 0,
    Banner = 1
}

const versionMapping = { [Type.Icon]: "icon", [Type.Banner]: "banner" };
@ccclass
export default class RemoteSpine extends cc.Component {
    @property
    public spineName = "icon-game";

    @property
    public animationName = "show";

    @property
    public host = "";
    public premultipliedAlpha = false;
    public id = -1;

    private spine: sp.Skeleton;

    readonly resourceExts = ["atlas", "json", "png"];

    private cache: SkeletonCache;

    public type = Type.Icon;

    async init(cache: SkeletonCache) {
        this.cache = cache;
        this.spine = this.node.getComponent(sp.Skeleton);
        await this.loadResources();
    }

    async loadResources() {
        if (this.cache?.[this.id]?.skeletonData) {
            this.spine.skeletonData = this.cache[this.id].skeletonData;
        } else {
            const spineRes = [];
            const versions = await GameUtils.getRemoteVersion(this.id);
            const versionType = versions?.[versionMapping[this.type]];

            for (const ext of this.resourceExts) {
                try {
                    const resName = `${this.spineName}.${ext}?v=${versionType}`;
                    const url = `${this.host}/${resName}`;
                    const data = await GameUtils.loadRemote(url);
                    if (data) {
                        spineRes.push(data);
                    }
                } catch (error) {}
            }
            const skeletonData = this.createSkeletonData(spineRes);
            this.applySkeletonData(skeletonData);

            this.cache[this.id] = {
                ...this.cache[this.id],
                skeletonData
            };
        }

        this.applySpineSettings();
    }

    async initLoadSharedResource(cache: SkeletonCache, config: RemoteSharedResourceConfig) {
        this.cache = cache;
        this.spine = this.node.getComponent(sp.Skeleton);
        await this.loadShareResources(config);
    }

    async loadShareResources(config: RemoteSharedResourceConfig) {
        if (this.cache?.[this.id]?.skeletonData) {
            this.spine.skeletonData = this.cache[this.id].skeletonData;
        } else {
            const spineRes = [];
            const version = config?.version || LobbyResourceManager.versionsCache.banners;

            for (const ext of this.resourceExts) {
                try {
                    const resName = `${this.spineName}.${ext}?v=${version}`;
                    const langPath = config?.languages[window.i18n.curLang] ? window.i18n.curLang : "en";
                    const data = await LobbyResourceManager.loadRemoteSharedResource(`banners/${this.id}/${langPath}/${resName}`);
                    if (data) {
                        spineRes.push(data);
                    }
                } catch (error) {}
            }
            const skeletonData = this.createSkeletonData(spineRes);
            this.applySkeletonData(skeletonData);

            this.cache[this.id] = {
                ...this.cache[this.id],
                skeletonData
            };
        }

        this.applySpineSettings();
    }

    createSkeletonData(spineRes: any[]): sp.SkeletonData {
        const skeletonData = new sp.SkeletonData();
        skeletonData.skeletonJson = spineRes[SpineFile.Json].json;
        skeletonData.atlasText = spineRes[SpineFile.Atlas].text;
        skeletonData.textures = [spineRes[SpineFile.Texture]];
        skeletonData["textureNames"] = [`${this.spineName}.${this.resourceExts[SpineFile.Texture]}`];
        return skeletonData;
    }

    applySkeletonData(skeletonData: sp.SkeletonData) {
        this.spine.skeletonData = skeletonData;
    }

    applySpineSettings() {
        this.spine.premultipliedAlpha = this.premultipliedAlpha;
        this.spine.enableBatch = true;
        this.spine.defaultAnimation = this.animationName;
        this.spine.setAnimation(0, this.animationName, true);
    }
}
