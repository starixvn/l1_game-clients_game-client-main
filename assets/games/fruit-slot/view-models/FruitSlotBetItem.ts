import BetItem from "../../_base/view-models/BetItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FruitSlotBetItem extends BetItem {
    @property(sp.Skeleton)
    startRoundAnim: sp.Skeleton = null;

    public setOdd(value: string) {
        if (this.odds) {
            this.odds.string = `x${value}`;
        }
    }

    public resetHighlight() {
        this.highlight.active = false;
        if (this.highlightBackground) {
            this.highlightBackground.active = false;
        }
        if (this.highlightBorder) {
            this.highlightBorder.active = false;
        }
    }
}
