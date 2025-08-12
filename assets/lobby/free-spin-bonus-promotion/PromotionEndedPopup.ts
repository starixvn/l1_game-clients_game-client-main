import { i18n } from "../../ClientModules";
import { numberWithCommas } from "../../common/helpers/NumberHelper";
import { freeSpinsPromotionHandler, FreeSpinsPromotionEvents } from "../../lobby/free-spin-bonus-promotion/FreeSpinsPromotionHandler";
import { uiManager } from "../../managers/GameUIManager";
import { TurnOverRequiredEvents } from "./TurnOverRequiredHandler";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PromotionEndedPopup extends cc.Component {
    @property(cc.Label) labelTitle: cc.Label = null;
    @property(cc.Label) labelMainMessage: cc.Label = null;
    @property(cc.Label) labelSubMessage: cc.Label = null;
    @property(cc.Label) labelTotalWin: cc.Label = null;
    @property(cc.Button) closeButton: cc.Button = null;
    public static hasShown = false;
    public show() {
        PromotionEndedPopup.hasShown = true;
        const { totalWin } = freeSpinsPromotionHandler.finishPromotion;
        uiManager.emitter.emit(FreeSpinsPromotionEvents.DESTROY_GIFT_CODE_NODE);
        uiManager.emitter.emit(FreeSpinsPromotionEvents.REQUEST_CLOSE_FREE_SPINS_PROMOTION);
        this.labelTotalWin.string = numberWithCommas(totalWin, 2, false);
        this.node.active = true;
        this.setupContent(totalWin);
    }

    private setupContent(totalWin: number) {
        const hasUsedAllBonusSpins = freeSpinsPromotionHandler.currentSpinCount === 0;

        const keyMap = {
            win_allUsed: {
                title: "FreeSpinBonus.FSB_notification_para1a",
                main: "FreeSpinBonus.FSB_end_notification",
                sub: "FreeSpinBonus.FSB_end_notification_message"
            },
            win_withRemaining: {
                title: "FreeSpinBonus.FSB_end_notification_unusedFS",
                main: "FreeSpinBonus.FSB_end_notification_unusedFS_message",
                sub: "FreeSpinBonus.FSB_end_notification_unusedFS_message1"
            },
            zero_allUsed: {
                title: "FreeSpinBonus.FSB_end_notification_zero_win",
                main: "",
                sub: "FreeSpinBonus.FSB_end_notification_zero_win_message"
            },
            zero_withRemaining: {
                title: "FreeSpinBonus.FSB_end_notification_unusedFS",
                main: "FreeSpinBonus.FSB_end_notification_unusedFS_message",
                sub: "FreeSpinBonus.FSB_end_notification_unusedFS_message1"
            }
        };

        const conditionKey = `${totalWin > 0 ? "win" : "zero"}_${hasUsedAllBonusSpins ? "allUsed" : "withRemaining"}`;
        const { title, main, sub } = keyMap[conditionKey];

        this.labelTitle.string = i18n.t(title).toUpperCase();
        this.labelMainMessage.string = main ? i18n.t(main) : "";
        this.labelSubMessage.string = sub ? i18n.t(sub) : "";
    }

    private onCloseClicked() {
        if (freeSpinsPromotionHandler.isEligibleForTurnOverPanel()) {
            uiManager.emitter.emit(TurnOverRequiredEvents.OPEN_TURN_OVER_REQUIRED);
        }
        cc.tween(this.node)
            .to(0.4, { scale: 0, opacity: 0 }, { easing: "backIn" })
            .call(() => {
                this.node.active = false;
                PromotionEndedPopup.hasShown = false;
            })
            .start();
    }

    onDestroy() {
        freeSpinsPromotionHandler.finishPromotion = null;
    }
}
