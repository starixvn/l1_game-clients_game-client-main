import AudioManager from "../../../../common/audio/AudioManager";
import SocketIOGameHistoryBase from "../../../_base/view-models/SocketIOGameHistoryBase";
import SevenUpDownHistoryItem from "./SevenUpDownHistoryItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SevenUpDownBetHistory extends SocketIOGameHistoryBase {
    @property(cc.Prefab)
    ticketDetailPrefab: cc.Prefab = null;
    public headerTitleColor = "#EDBB02";

    public handleBetHistory = (roundId) => {};
    bindItemRowData(betLog, index) {
        const itemNode = cc.instantiate(this.itemPrefab);
        const item = itemNode.getComponent(SevenUpDownHistoryItem);
        item.setData(betLog, index);
        this.content.addChild(itemNode);
        item.openTicketDetail = () => {
            AudioManager.getInstance().playClick();
            this.showTicketDetail(betLog);
        };
        item.init(this.socket);
    }

    openBetHistory(roundId: number) {
        this.handleBetHistory(roundId);
    }

    showTicketDetail(data: any) {
        const node = cc.instantiate(this.ticketDetailPrefab);
        //const detail = node.getComponent(MiniCoinTossTicketDetail);
        this.node.addChild(node);
    }
}
