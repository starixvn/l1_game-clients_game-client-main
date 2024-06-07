import SocketIOGameHistoryBase from "../../_base/view-models/SocketIOGameHistoryBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MiniCoinTossHistory extends SocketIOGameHistoryBase {
    bindItemRowData(betLog, index) {
        // super.bindItemRowData(betLog, index);
        // const itemNode = cc.instantiate(this.itemPrefab);
        // const item = itemNode.getComponent(MultiplaySedieHistoryItem);
        // item.setData(betLog, index);
        // this.content.addChild(itemNode);
    }
}
