import BetItem from "../../_base/view-models/BetItem";

const { ccclass } = cc._decorator;

@ccclass
export default class SevenUpDownBetItem extends BetItem {
    protected setHighlightItems(highlight: boolean, isAnimated = true) {
        this.setHighlightItemsOptions(highlight, isAnimated);
    }
}
