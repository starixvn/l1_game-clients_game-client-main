import GameUtils from "../../../../common/GameUtils";
import SocketIOGameHistoryBase from "../../../_base/view-models/SocketIOGameHistoryBase";
import { WinThreeCardsBetData } from "../WinThreeCardsModel";
import WinThreeCardsTicketDetail from "./ticket-detail/WinThreeCardsTicketDetail";
import WinThreeCardsHistoryItem from "./WinThreeCardsHistoryItem";

const { ccclass, property } = cc._decorator;
@ccclass
export default class WinThreeCardsHistory extends SocketIOGameHistoryBase {
    @property(cc.Prefab)
    ticketDetailPrefab: cc.Prefab = null;

    bindItemRowData(betLog: WinThreeCardsBetData, index: number) {
        const itemNode = cc.instantiate(this.itemPrefab);
        const item = itemNode.getComponent(WinThreeCardsHistoryItem);
        item.setData(betLog);
        item.showTicketDetail = (data) => this.showTicketDetail(data);
        item.showBackground(index % 2 !== 0);
        this.content.addChild(itemNode);
        GameUtils.setFontSizeLabelsInNode(itemNode);
    }

    private showTicketDetail(data: WinThreeCardsBetData) {
        const ticketDetailPrefab = cc.instantiate(this.ticketDetailPrefab);
        this.node.addChild(ticketDetailPrefab);

        const ticketDetailComponent = ticketDetailPrefab.getComponent(WinThreeCardsTicketDetail);
        ticketDetailComponent.setData(data);
        ticketDetailComponent.showBetLogs(data);
    }
}
