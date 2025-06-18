import GameUtils from "../../../common/GameUtils";
import { numberWithCommas } from "../../../common/helpers/NumberHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PromotionEndedPopup extends cc.Component {
    @property(cc.Label) labelTotalWin: cc.Label = null;
    @property(cc.Button) closeButton: cc.Button = null;

    private static hasShown = false;
    onLoad() {
        this.closeButton.node.on("click", this.onCloseClicked, this);
    }

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
        cc.tween(this.node)
            .to(0.4, { scale: 0, opacity: 0 }, { easing: "backIn" })
            .call(() => {
                this.node.active = false;
            })
            .start();
    }
}
