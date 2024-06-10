import BetItem from "../../_base/view-models/BetItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MiniCoinTossBetItem extends BetItem {
    @property(cc.Label)
    betPercent: cc.Label = null;
    public setHighlight(highlight: boolean, isAnimated = true) {
        super.setHighlight(highlight, isAnimated);

        if (this.highlightBorder) {
            this.highlightBorder.active = highlight && !isAnimated;
        }
    }
}
