import { Banner } from "sc-user-service-client/dist/lobby";
import { lazyInject } from "../../Application";
import GameUtils from "../../common/GameUtils";
import { userManager } from "../../common/user/UserManager";
import { appManager } from "../../managers/AppManager";
import { uiManager } from "../../managers/GameUIManager";
import { InternalEvents } from "../../managers/InternalEvents";
import LobbyDialogManager from "../../managers/LobbyDialogManager";
import { StorageManager } from "../../managers/StorageManager";
import LobbyMenuConfig from "../main/view-models/LobbyMenuConfig";
import CenterBanner, { BannerItemData, CENTER_BANNER_DONT_SHOW_STORAGE_KEY } from "./center-banner";
const { ccclass, property } = cc._decorator;

@ccclass
export default class CenterBannerContainer extends cc.Component {
    @property(cc.Prefab)
    bannerPrefab: cc.Prefab = null;

    @lazyInject(LobbyMenuConfig)
    private readonly lobbyMenuConfig: LobbyMenuConfig;

    onLoad() {
        appManager.hasShowedCenterBanner = StorageManager.get(CENTER_BANNER_DONT_SHOW_STORAGE_KEY) ?? false;

        if (appManager.hasShowedCenterBanner) {
            return;
        }
        uiManager.emitterListener(
            InternalEvents.CENTER_BANNER_SHOW,
            () => LobbyDialogManager.getInstance().addDialog(this.initCenterBanner.bind(this), "CenterBanner"),
            this
        );
    }

    onDestroy(): void {
        uiManager.removeListenersWithTarget(this);
    }

    async initCenterBanner() {
        if (appManager.hasShowedCenterBanner) {
            return;
        }

        try {
            const banners = await this.loadBanners();
            this.showBanners(banners);
        } catch (error) {
            console.log("Load banners error", error);
        }
    }

    private getFilteredBanners() {
        return this.lobbyMenuConfig.centerBanners.filter((banner) => userManager.offerGames.includes(banner.gameId));
    }

    private async loadBanners(): Promise<BannerItemData[]> {
        const filterList = this.getFilteredBanners();
        const bannerPromises = filterList.map((banner) => this.loadBannerData(banner));
        const results = await Promise.all(bannerPromises);

        return results.filter((result) => result !== null);
    }

    private async loadBannerData(banner: Banner): Promise<BannerItemData | null> {
        try {
            const path = `center-banners/${banner.gameId}`;
            const versionsPath = `${path}/versions.json`;
            const data = await GameUtils.loadRemoteFromSharedResource<any>(versionsPath, true);

            if (data) {
                const spriteFrame = await this.loadBannerImage(data, path);
                if (spriteFrame) {
                    return { ...banner, spriteFrame };
                }
            }
        } catch (e) {
            console.log("Can not load banner", banner.gameId);
        }

        return null;
    }

    private async loadBannerImage(data: any, path: string): Promise<cc.SpriteFrame | null> {
        const languages = [window.i18n.curLang, "en", "vi"];
        for (const lang of languages) {
            const fileName = `${lang}.webp`;
            if (data.json[fileName]) {
                const imageAsset = await GameUtils.loadRemoteFromSharedResource<cc.Texture2D>(`${path}/${fileName}`, true);
                if (imageAsset) {
                    const spriteFrame = new cc.SpriteFrame();
                    spriteFrame.setTexture(imageAsset);
                    return spriteFrame;
                }
            }
        }
        return null;
    }

    private showBanners(banners: BannerItemData[]) {
        this.showCenterBanner(banners);
        appManager.hasShowedCenterBanner = true;
    }

    private showCenterBanner(banners: BannerItemData[]) {
        const node = cc.instantiate(this.bannerPrefab);
        const banner = node.getComponent(CenterBanner);
        banner.init(banners);
        this.node.addChild(node);
    }
}
