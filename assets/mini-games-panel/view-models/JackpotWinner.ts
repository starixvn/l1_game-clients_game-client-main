import GameUtils from "../../common/GameUtils";
import { numberWithCommas } from "../../common/helpers/NumberHelper";
import { userManager } from "../../common/user/UserManager";
import { uiManager } from "../../managers/GameUIManager";
import { InternalEvents } from "../../managers/InternalEvents";
import PopupMinigames from "./popup/PopupMinigames";

const { ccclass, property } = cc._decorator;

@ccclass
export default class JackpotWinner extends cc.Component {
    @property(cc.Label)
    username: cc.Label = null;

    @property(cc.Label)
    amount: cc.Label = null;

    @property(cc.Label)
    gameName: cc.Label = null;

    popupMiniGame: PopupMinigames = null;

    onLoad() {
        this.initEvents();
        this.resetJackPotWinner();
    }

    resetJackPotWinner() {
        this.username.string = "";
        this.amount.string = "";
        this.gameName.string = "";
    }

    onDestroy() {
        uiManager.removeListenersWithTarget(this);
    }

    initEvents() {
        uiManager.emitterListener(InternalEvents.RECEIVED_JACKPOT_WINNER, (data) => this.onData(data), this);
    }

    onData(data: any) {
        if (userManager.userName !== data.winnerName && !userManager.disableJackpotGames) {
            const jackPotContainer = this.popupMiniGame.jackPotContainer;
            jackPotContainer.width = this.node.width;
            jackPotContainer.height = this.node.height;

            const menuIcon = this.popupMiniGame.menuIcon;
            menuIcon.active = false;

            this.username.string = data.winnerName;
            this.amount.string = numberWithCommas(GameUtils.getValueByCurrency(data.amount), 2);
            this.gameName.string = GameUtils.getGameNameString(data.gameId);

            jackPotContainer.active = true;

            cc.tween(this)
                .delay(6)
                .call(() => {
                    if (!this.node.isValid) {
                        return;
                    }
                    jackPotContainer.active = false;
                    menuIcon.active = true;
                })
                .start();
        }
    }
}
