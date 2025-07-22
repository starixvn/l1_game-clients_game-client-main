import { i18n } from "../../ClientModules";
import { numberWithCommas } from "../../common/helpers/NumberHelper";
import { freeSpinsPromotionHandler } from "../../lobby/free-spin-bonus-promotion/FreeSpinsPromotionHandler";
import { uiManager } from "../../managers/GameUIManager";
import { TurnOverRequiredEvents, turnOverRequiredHandler } from "./TurnOverRequiredHandler";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PromotionEndedPopup extends cc.Component {
    @property(cc.Label) labelTitle: cc.Label = null;
    @property(cc.Label) labelMainMessage: cc.Label = null;
    @property(cc.Label) labelSubMessage: cc.Label = null;
    @property(cc.Label) labelTotalWin: cc.Label = null;
    @property(cc.Button) closeButton: cc.Button = null;

    private static hasShown = false;

    public show(finishPromotion: any) {
        if (!finishPromotion || PromotionEndedPopup.hasShown || !finishPromotion.endPromotion) {
            return;
        }

        const { totalWin } = finishPromotion;
        if (freeSpinsPromotionHandler.giftCodeNode?.isValid) {
            freeSpinsPromotionHandler.giftCodeNode.destroy();
            freeSpinsPromotionHandler.giftCodeNode = null;
        }

        PromotionEndedPopup.hasShown = true;
        this.labelTotalWin.string = numberWithCommas(totalWin, 2);

        this.node.active = true;
        this.setupContent(totalWin);
    }

    private setupContent(totalWin: number) {
        const isUsedUp = freeSpinsPromotionHandler.currentSpinCount === 0;

        let titleKey = "";
        let mainMessageKey = "";
        let subMessageKey = "";

        if (totalWin > 0) {
            if (isUsedUp) {
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
        const totalWin = Number(this.labelTotalWin.string.replace(/,/g, ""));
        const isUsedUp = freeSpinsPromotionHandler.currentSpinCount === 0;
        freeSpinsPromotionHandler.finishPromotion = null;
        if (totalWin > 0 && isUsedUp) {
            uiManager.emitter.emit(TurnOverRequiredEvents.OPEN_TURN_OVER_REQUIRED, turnOverRequiredHandler.toProgress);
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
