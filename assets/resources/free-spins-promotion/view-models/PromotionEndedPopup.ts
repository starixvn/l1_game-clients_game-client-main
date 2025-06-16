import { numberWithCommas } from "../../../common/helpers/NumberHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PromotionEndedPopup extends cc.Component {
    @property(cc.Label) labelTitle: cc.Label = null;
    @property(cc.Label) labelTotalWin: cc.Label = null;
    @property(cc.Button) closeButton: cc.Button = null;

    private static hasShown = false;
    onLoad() {
        this.closeButton.node.on("click", this.onCloseClicked, this);
    }

    public show(finishPromotion: any) {
        const { endPromotion, totalWin } = finishPromotion;
        if (PromotionEndedPopup.hasShown || !endPromotion) {
            return;
        }

        PromotionEndedPopup.hasShown = true;
        this.labelTotalWin.string = numberWithCommas(totalWin, 2);

        this.node.active = true;
    }

    private onCloseClicked() {
        this.node.active = false;
    }
}
