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

    public show() {
        if (!freeSpinsPromotionHandler.finishPromotion?.endPromotion) {
            return;
        }

        const { totalWin } = freeSpinsPromotionHandler.finishPromotion;
        uiManager.emitter.emit(FreeSpinsPromotionEvents.DESTROY_GIFT_CODE_NODE);
        this.labelTotalWin.string = numberWithCommas(totalWin, 2);
        this.node.active = true;
        this.setupContent(totalWin);
    }

    private setupContent(totalWin: number) {
        const hasUsedAllBonusSpins = freeSpinsPromotionHandler.currentSpinCount === 0;

        let titleKey = "";
        let mainMessageKey = "";
        let subMessageKey = "";

        if (totalWin > 0) {
            if (hasUsedAllBonusSpins) {
                titleKey = "FreeSpinBonus.FSB_notification_para1a";
                mainMessageKey = "FreeSpinBonus.FSB_end_notification";
                subMessageKey = "FreeSpinBonus.FSB_end_notification_message";
            } else {
                titleKey = "FreeSpinBonus.FSB_end_notification_unusedFS";
                mainMessageKey = "FreeSpinBonus.FSB_end_notification_unusedFS_message";
                subMessageKey = "FreeSpinBonus.FSB_end_notification_unusedFS_message1";
            }
        } else {
            titleKey = "FreeSpinBonus.FSB_end_notification_zero_win";
            subMessageKey = "FreeSpinBonus.FSB_end_notification_zero_win_message";
        }

        this.labelTitle.string = i18n.t(titleKey).toUpperCase();
        this.labelMainMessage.string = mainMessageKey ? i18n.t(mainMessageKey) : "";
        this.labelSubMessage.string = subMessageKey ? i18n.t(subMessageKey) : "";
    }

    private onCloseClicked() {
        if (freeSpinsPromotionHandler.isEligibleForTurnOverPanel()) {
            uiManager.emitter.emit(TurnOverRequiredEvents.OPEN_TURN_OVER_REQUIRED);
        }
        cc.tween(this.node)
            .to(0.4, { scale: 0, opacity: 0 }, { easing: "backIn" })
            .call(() => {
                this.node.active = false;
            })
            .start();
    }

    onDestroy() {
        freeSpinsPromotionHandler.finishPromotion = null;
    }
}
