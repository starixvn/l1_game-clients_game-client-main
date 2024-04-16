import BetItem from "../../_base/view-models/BetItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BlockchainBaccaratBetItem extends BetItem {
    @property(cc.Label)
    betPercent: cc.Label = null;

    public resetHighlight() {
        this.highlight.active = false;
        if (this.highlightBackground) {
            this.highlightBackground.active = false;
        }
    }
}
