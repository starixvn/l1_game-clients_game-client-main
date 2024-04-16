import BasicHistoryBoard from "../../../../_base/view-models/BasicHistoryBoard";

const { ccclass } = cc._decorator;

@ccclass
export default class WinThreeCardsBasicHistoryBoard extends BasicHistoryBoard {
    protected handleOptionalData(dot: cc.Node, history) {
        // override
    }
}
