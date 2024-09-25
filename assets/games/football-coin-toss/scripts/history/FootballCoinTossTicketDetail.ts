import GameTicketDetailBase from "../../../_base/view-models/GameTicketDetailBase";
import FootballCoinTossDetailResultGroup from "./FootballCoinTossDetailResultGroup";
import FootballCoinTossTicketDetailItem from "./FootballCoinTossTicketDetailItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FootballCoinTossTicketDetail extends GameTicketDetailBase {
    @property(cc.Prefab)
    ticketItemPrefab: cc.Prefab = null;
    @property(cc.Prefab)
    ticketDetailGroup: cc.Prefab = null;

    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;

    @property(cc.Node)
    groupContent: cc.Node = null;

    setData(data: any) {
        const { betLogDetails, odds, settlementResult, match } = data;
        const ticketDetailGroup = cc.instantiate(this.ticketDetailGroup);
        const detailGroupComponent = ticketDetailGroup.getComponent(FootballCoinTossDetailResultGroup);
        this.groupContent.addChild(ticketDetailGroup);
        detailGroupComponent.createBetLogItem(data);
        betLogDetails.forEach((detail, index) => {
            const node = cc.instantiate(this.ticketItemPrefab);
            this.content.addChild(node);
            node.active = true;
            const item = node.getComponent(FootballCoinTossTicketDetailItem);
            item.setData(detail, settlementResult, odds, match, index);
        });
        this.scrollView?.scrollToTop(0.1);
    }
}
