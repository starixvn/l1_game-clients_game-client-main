import SocketIOGameHistoryBase from "../../../_base/view-models/SocketIOGameHistoryBase";
import FanTanHistoryItem from "./FanTanHistoryItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FanTanHistory extends SocketIOGameHistoryBase {
    bindItemRowData(betLog, index) {
        const itemNode = cc.instantiate(this.itemPrefab);
        const item = itemNode.getComponent(FanTanHistoryItem);
        item.setData(betLog, index);
        this.content.addChild(itemNode);
    }
}
