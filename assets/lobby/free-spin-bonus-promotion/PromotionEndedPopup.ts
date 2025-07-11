import { i18n } from "../../ClientModules";
import GameUtils from "../../common/GameUtils";
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
        const canvas = cc.find("Canvas");
        const giftPopup = GameUtils.findNodeByNameRecursive(canvas, "GiftCodePopup");

        if (giftPopup) {
            giftPopup.destroy();
        }
        PromotionEndedPopup.hasShown = true;
        this.labelTotalWin.string = numberWithCommas(totalWin, 2);

        this.node.active = true;
        this.setupContent(totalWin);
    }

    private setupContent(totalWin: number) {
        const isUsedUp = freeSpinsPromotionHandler.getFreeSpinsUsedUp();

        let titleKey = "";
        let mainMessageKey = "";
        let subMessageKey = "";

        if (totalWin > 0) {
            if (isUsedUp) {
                titleKey = "freeSpinsPromotion.FSB_notification_para1a";
                mainMessageKey = "freeSpinsPromotion.FSB_end_notification";
                subMessageKey = "freeSpinsPromotion.FSB_end_notification_message";
            } else {
                titleKey = "freeSpinsPromotion.FSB_end_notification_unusedFS";
                mainMessageKey = "freeSpinsPromotion.FSB_end_notification_unusedFS_message";
                subMessageKey = "freeSpinsPromotion.FSB_end_notification_unusedFS_message1";
            }
        } else {
            titleKey = "freeSpinsPromotion.FSB_end_notification_zero_win";
            subMessageKey = "freeSpinsPromotion.FSB_end_notification_zero_win_message";
        }

        this.labelTitle.string = i18n.t(titleKey).toUpperCase();
        this.labelMainMessage.string = mainMessageKey ? i18n.t(mainMessageKey) : "";
        this.labelSubMessage.string = subMessageKey ? i18n.t(subMessageKey) : "";
    }

    private onCloseClicked() {
        const totalWin = Number(this.labelTotalWin.string.replace(/,/g, ""));
        const isUsedUp = freeSpinsPromotionHandler.getFreeSpinsUsedUp();
        if (totalWin > 0 && isUsedUp) {
            uiManager.emitter.emit(TurnOverRequiredEvents.OPEN_TURN_OVER_REQUIRED, turnOverRequiredHandler.getPromotionTOProgress());
        }
        cc.tween(this.node)
            .to(0.4, { scale: 0, opacity: 0 }, { easing: "backIn" })
            .call(() => {
                this.node.active = false;
                PromotionEndedPopup.hasShown = false;
            })
            .start();
    }
}
