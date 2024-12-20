import RemoteSpine, { Type } from "../../../../common/RemoteSpine";
import { IInfoShareResourceBanner, lobbyResourceManager } from "../LobbyResourceManager";
import SkeletonBanner from "../SkeletonBanner";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SkeletonBannerTheme extends SkeletonBanner {
    @property({ type: cc.Node, override: true, visible: false })
    lightTop: cc.Node = null;

    public override async createRemoteIconNode(id: number) {
        const node = new cc.Node();
        try {
            const configFile = this.cache[id]
                ? this.cache[id].configFile
                : await lobbyResourceManager?.resourceLoader?.loadRemoteInfoBanner(id);

            const iconConfig: IInfoShareResourceBanner = configFile?.json;

            node.addComponent(sp.Skeleton);
            const remoteSpine = node.addComponent(RemoteSpine);
            remoteSpine.id = id;
            remoteSpine.spineName = this.spineName;
            remoteSpine.premultipliedAlpha = iconConfig ? iconConfig.premultipliedAlpha : false;
            remoteSpine.type = Type.Banner;
            remoteSpine.useWebp = true;
            await remoteSpine.initLoadSharedResource(this.cache, iconConfig);
            node.active = false;
        } catch (error) {
            cc.log("No banner for game " + id);
            return null;
        }

        return node;
    }

    public override async loadAnimation(id: number) {
        const gameNode = await this.createRemoteIconNode(id);
        if (gameNode) {
            this.hideSkeleton();
            this.gameContent?.childrenCount === 0 && (gameNode.active = true);
            this.gameContent?.addChild(gameNode);
        }
    }
}
