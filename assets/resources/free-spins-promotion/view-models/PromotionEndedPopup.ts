import GameUtils from "../../../common/GameUtils";
import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import { FreeSpinsPromotionEvents } from "../../../lobby/promotions/FreeSpinsPromotionHandler";
import { uiManager } from "../../../managers/GameUIManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PromotionEndedPopup extends cc.Component {
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
    }

    private onCloseClicked() {
        uiManager.emitter.emit(FreeSpinsPromotionEvents.OPEN_TURN_OVER_REQUIRED);
        cc.tween(this.node)
            .to(0.4, { scale: 0, opacity: 0 }, { easing: "backIn" })
            .call(() => {
                this.node.active = false;
            })
            .start();
    }
}
