import SocketIOGameHistoryBase from "../../_base/view-models/SocketIOGameHistoryBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MiniCoinTossHistory extends SocketIOGameHistoryBase {
    bindItemRowData(betLog, index) {
        // handle
    }
}
