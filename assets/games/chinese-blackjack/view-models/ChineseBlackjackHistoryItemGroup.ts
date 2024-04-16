import SocketIOGameHistoryItemGroupBase from "../../_base/view-models/SocketIOGameHistoryItemGroupBase";
import ChineseBlackjackHistoryItem, { IDataLog } from "./ChineseBlackjackHistoryItem";

const { ccclass } = cc._decorator;

@ccclass
export default class ChineseBlackjackHistoryItemGroup extends SocketIOGameHistoryItemGroupBase {
    addItem(log: IDataLog, index?: number, isLastRow = false) {
        const historyItemPrefab = cc.instantiate(this.itemPrefab);
        const item = historyItemPrefab.getComponent(ChineseBlackjackHistoryItem);
        this.container.addChild(historyItemPrefab);
        item.setData(log);
        item.setBackground(index);
        isLastRow && this.hideLine();
        this.container.getComponent(cc.Layout).updateLayout();
    }
}
