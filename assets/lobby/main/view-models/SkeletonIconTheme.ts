import GameNotification from "./GameNotification";
import JackpotPoolInfo from "./JackpotPoolInfo";
import LobbyResourceManager from "./LobbyResourceManager";
import SkeletonIcon from "./SkeletonIcon";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SkeletonIconTheme extends SkeletonIcon {
    @property({ type: cc.Node, override: true, visible: false })
    lightTop: cc.Node = null;

    @property(JackpotPoolInfo)
    jackpotPoolInfo: JackpotPoolInfo = null;

    public async loadAnimation(id: number, categoryIndex = 0) {
        const spriteFrame = await LobbyResourceManager.loadGameIcon(id);
        if (spriteFrame) {
            this.hideSkeleton();
            this.gameContent.getComponent(cc.Sprite).spriteFrame = spriteFrame;
            this.updateNewTag(id, categoryIndex);
        }
        this.updateJackpotPoolInfo(id);
        this.updateReceiveNotification(id);
    }

    private updateReceiveNotification(id: number) {
        const gameNotificationComp = this.node.getComponent(GameNotification);
        if (gameNotificationComp) {
            gameNotificationComp.gameId = id;
            gameNotificationComp.initReceiveEvents();
        }
    }

    private updateJackpotPoolInfo(id: number) {
        if (this.jackpotPoolInfo) {
            this.jackpotPoolInfo.gameId = id;
            this.jackpotPoolInfo.initReceiveEvents();
        }
    }
}
