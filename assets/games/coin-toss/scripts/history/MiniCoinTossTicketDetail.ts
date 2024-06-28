import GameTicketDetailBase from "../../../_base/view-models/GameTicketDetailBase";
import MiniCoinTossDetailResultGroup from "./MiniCoinTossDetailResultGroup";
import MiniCoinTossTicketDetailItem from "./MiniCoinTossTicketDetailItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MiniCoinTossTicketDetail extends GameTicketDetailBase {
    @property(cc.Prefab)
    ticketItemPrefab: cc.Prefab = null;
    @property(cc.Prefab)
    ticketDetailGroup: cc.Prefab = null;

    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;

    @property(cc.Node)
    groupContent: cc.Node = null;

    setData(data: any, symbolSprites: cc.SpriteFrame[]) {
        const { betLogDetails, odds, settlementResult } = data;
        const ticketDetailGroup = cc.instantiate(this.ticketDetailGroup);
        const detailGroupComponent = ticketDetailGroup.getComponent(MiniCoinTossDetailResultGroup);
        this.groupContent.addChild(ticketDetailGroup);
        detailGroupComponent.createBetLogItem(data, symbolSprites);
        betLogDetails.forEach((detail, index) => {
            const node = cc.instantiate(this.ticketItemPrefab);
            this.content.addChild(node);
            node.active = true;
            const item = node.getComponent(MiniCoinTossTicketDetailItem);
            item.setData(detail, settlementResult, odds, index);
        });
        this.scrollView?.scrollToTop(0.1);
    }
}
