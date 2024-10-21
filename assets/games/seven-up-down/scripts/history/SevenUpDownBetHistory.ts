import AudioManager from "../../../../common/audio/AudioManager";
import ProvablyFairVerifyComponent from "../../../_base/view-models/provably-fair/ProvablyFairVerifyComponent";
import SocketIOGameHistoryBase from "../../../_base/view-models/SocketIOGameHistoryBase";
import MiniCoinTossTicketDetail from "./MiniCoinTossTicketDetail";
import SevenUpDownHistoryItem from "./SevenUpDownHistoryItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SevenUpDownBetHistory extends SocketIOGameHistoryBase {
    @property({ type: ProvablyFairVerifyComponent, visible: true })
    provablyFairVerifyComponent: ProvablyFairVerifyComponent = null;

    @property(cc.Prefab)
    ticketDetailPrefab: cc.Prefab = null;

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
        const detail = node.getComponent(MiniCoinTossTicketDetail);
        this.node.addChild(node);
    }
}
