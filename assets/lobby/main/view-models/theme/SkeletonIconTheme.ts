import { FormationHandler } from "../../../../common/i18n/FormationHandler";
import StringUtil from "../../../../common/utils/StringUtil";
import { uiManager } from "../../../../managers/GameUIManager";
import GameNotification from "./../GameNotification";
import JackpotPoolInfo from "./../JackpotPoolInfo";
import LobbyResourceManager from "./../LobbyResourceManager";
import SkeletonIcon from "./../SkeletonIcon";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SkeletonIconTheme extends SkeletonIcon {
    @property({ type: cc.Node, override: true, visible: false })
    lightTop: cc.Node = null;

    @property(JackpotPoolInfo)
    jackpotPoolInfo: JackpotPoolInfo = null;

    override setGameName(text: string, gameId: number, formatGameName: FormationHandler) {
        debugger;
        this.gameName.node.active = true;
        this.gameName.string = LobbyResourceManager.getInstance()?.infoShareResource?.ignoreCapitalizeGameNames.includes(gameId)
            ? text
            : StringUtil.formatText(text, formatGameName);
    }

    override setGameContent(id: number, gameIconIndex: number, categoryIndex: number, addListIconObscure: (icon: SkeletonIcon) => void) {
        if (!!uiManager.spriteFrameCache.lobbyIcons[id]) {
            this.loadAnimation(id, categoryIndex);
        } else {
            addListIconObscure(this);
        }
    }

    public override async loadAnimation(id: number, categoryIndex = 0) {
        const cachedSprite = uiManager.spriteFrameCache.lobbyIcons[id]?.spriteFrame;
        const spriteFrame = cachedSprite || (await LobbyResourceManager.getInstance().loadGameIcon(id));

        if (spriteFrame) {
            this.hideSkeleton();
            const spriteComponent = this.gameContent.getComponent(cc.Sprite);
            spriteComponent.spriteFrame = spriteFrame;
            this.updateNewTag(id, categoryIndex);
        }

        this.updateJackpotPoolInfo(id);
        this.updateReceiveNotification(id);
    }

    private updateReceiveNotification(id: number) {
        const gameNotificationComp = this.node.getComponent(GameNotification);
        gameNotificationComp && (gameNotificationComp.gameId = id);
    }

    private updateJackpotPoolInfo(id: number) {
        this.jackpotPoolInfo && (this.jackpotPoolInfo.gameId = id);
    }
}
