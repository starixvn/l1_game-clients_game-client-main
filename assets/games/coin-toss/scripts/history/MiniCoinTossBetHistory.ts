import AudioManager from "../../../../common/audio/AudioManager";
import SocketIOGameHistoryBase from "../../../_base/view-models/SocketIOGameHistoryBase";
import MiniCoinTossHistoryItem from "./MiniCoinTossHistoryItem";
import MiniCoinTossTicketDetail from "./MiniCoinTossTicketDetail";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MiniCoinTossBetHistory extends SocketIOGameHistoryBase {
    @property(cc.Prefab)
    ticketDetailPrefab: cc.Prefab = null;

    @property(cc.SpriteFrame)
    symbolSprites: cc.SpriteFrame[] = [];
    public handleBetHistory = (roundId) => {};
    bindItemRowData(betLog, index) {
        const itemNode = cc.instantiate(this.itemPrefab);
        const item = itemNode.getComponent(MiniCoinTossHistoryItem);
        item.setData(betLog, this.symbolSprites, index);
        this.content.addChild(itemNode);
        item.openTicketDetail = () => {
            AudioManager.getInstance().playClick();
            this.showTicketDetail(betLog);
        };
    }

    openBetHistory(roundId: number) {
        this.handleBetHistory(roundId);
    }

    showTicketDetail(data: any) {
        const node = cc.instantiate(this.ticketDetailPrefab);
        const detail = node.getComponent(MiniCoinTossTicketDetail);
        this.node.addChild(node);
        detail.setData(data, this.symbolSprites);
    }
}
