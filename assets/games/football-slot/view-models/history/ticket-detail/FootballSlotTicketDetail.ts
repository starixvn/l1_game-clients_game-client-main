import GameTicketDetailBase from "../../../../_base/view-models/GameTicketDetailBase";
import { BetLog, FootballSlotBetLogDetail, FootballSlotOdds } from "../FootballSlotHistory";
import FootballSlotTicketDetailItem from "./FootballSlotTicketDetailItem";
import FootballSlotTicketDetailResultGroup from "./FootballSlotTicketDetailResultGroup";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FootballSlotTicketDetail extends GameTicketDetailBase {
    @property(cc.Prefab)
    ticketDetailItemPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    footballSlotTicketDetailGroup: cc.Prefab = null;

    @property(cc.Node)
    groupContent: cc.Node = null;

    public showbetLogs(symbolSprites: cc.SpriteFrame[], odds: FootballSlotOdds, betLogs: BetLog) {
        this.node.active = true;

        const fruitSlotTicketDetailGroup = cc.instantiate(this.footballSlotTicketDetailGroup);
        const fruitSlotTicketDetailGroupmComponent = fruitSlotTicketDetailGroup.getComponent(FootballSlotTicketDetailResultGroup);
        this.groupContent.addChild(fruitSlotTicketDetailGroup);
        fruitSlotTicketDetailGroupmComponent.createBetLogItem(betLogs, symbolSprites);

        this.betLogDetails.forEach((betLogDetail: FootballSlotBetLogDetail, index: number) =>
            this.builTicketDetailRow(betLogDetail, index, symbolSprites, odds)
        );
    }

    private builTicketDetailRow(betLogDetail: FootballSlotBetLogDetail, index: number, symbolSprites: cc.SpriteFrame[], odds: FootballSlotOdds) {
        const ticketDetailItem = cc.instantiate(this.ticketDetailItemPrefab);
        const ticketDetailItemComponent = ticketDetailItem.getComponent(FootballSlotTicketDetailItem);
        this.content.addChild(ticketDetailItem);
        ticketDetailItemComponent.updateContent(betLogDetail, odds, this.settlementResult, symbolSprites, index);
    }
}
