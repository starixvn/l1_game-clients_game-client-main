import SocketIOGameHistoryBase from "../../../_base/view-models/SocketIOGameHistoryBase";
import MiniCoinTossHistoryItem from "../MiniCoinTossHistoryItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MiniCoinTossBetHistory extends SocketIOGameHistoryBase {
    bindItemRowData(betLog, index) {
        const historyItemPrefab = cc.instantiate(this.itemPrefab);
        const item = historyItemPrefab.getComponent(MiniCoinTossHistoryItem);
        item.setData(betLog, index);
        this.content.addChild(historyItemPrefab);
    }
}
