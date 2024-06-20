import BetItem from "../../_base/view-models/BetItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MiniCoinTossBetItem extends BetItem {
    @property(cc.Node)
    normalIcon: cc.Node = null;

    @property(cc.Node)
    loseIcon: cc.Node = null;
    public setHighlight(highlight: boolean, isAnimated = true) {
        super.setHighlight(highlight, isAnimated);

        if (this.highlightBorder) {
            this.highlightBorder.active = highlight && !isAnimated;
        }
    }

    public handleHighlightAnim(isActive: boolean) {
        this.normalIcon && (this.normalIcon.active = !isActive);
        this.loseIcon && (this.loseIcon.active = isActive);
        this.odds.node.opacity = isActive ? 150 : 255;
    }
}
