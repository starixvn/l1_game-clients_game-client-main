import AudioManager from "../../../../common/audio/AudioManager";
import SocketIOGameHistoryBase from "../../../_base/view-models/SocketIOGameHistoryBase";
import FootballCoinTossHistoryItem from "./FootballCoinTossHistoryItem";
import FootballCoinTossTicketDetail from "./FootballCoinTossTicketDetail";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FootballCoinTossBetHistory extends SocketIOGameHistoryBase {
    constructor() {
        super();
        this.enablePF = true;
    }

    @property(cc.Prefab)
    ticketDetailPrefab: cc.Prefab = null;

    public handleBetHistory = (roundId) => {};
    bindItemRowData(betLog, index) {
        const itemNode = cc.instantiate(this.itemPrefab);
        const item = itemNode.getComponent(FootballCoinTossHistoryItem);
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
        const detail = node.getComponent(FootballCoinTossTicketDetail);
        this.node.addChild(node);
        detail.setData(data);
    }
}
