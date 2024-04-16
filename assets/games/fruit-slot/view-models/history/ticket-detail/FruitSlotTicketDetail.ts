import GameTicketDetailBase from "../../../../_base/view-models/GameTicketDetailBase";
import { BetLog, FruitSlotBetLogDetail, FruitSlotOdds } from "../FruitSlotHistory";
import FruitSlotTicketDetailItem from "./FruitSlotTicketDetailItem";
import FruitSlotTicketDetailResultGroup from "./FruitSlotTicketDetailResultGroup";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FruitSlotTicketDetail extends GameTicketDetailBase {
    @property(cc.Prefab)
    ticketDetailItemPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    fruitSlotTicketDetailGroup: cc.Prefab = null;

    @property(cc.Node)
    groupContent: cc.Node = null;

    public showbetLogs(symbolSprites: cc.SpriteFrame[], odds: FruitSlotOdds, betLogs: BetLog) {
        this.node.active = true;

        const fruitSlotTicketDetailGroup = cc.instantiate(this.fruitSlotTicketDetailGroup);
        const fruitSlotTicketDetailGroupmComponent = fruitSlotTicketDetailGroup.getComponent(FruitSlotTicketDetailResultGroup);
        this.groupContent.addChild(fruitSlotTicketDetailGroup);
        fruitSlotTicketDetailGroupmComponent.createBetLogItem(betLogs, symbolSprites);

        this.betLogDetails.forEach((betLogDetail: FruitSlotBetLogDetail, index: number) =>
            this.builTicketDetailRow(betLogDetail, index, symbolSprites, odds)
        );
    }

    private builTicketDetailRow(betLogDetail: FruitSlotBetLogDetail, index: number, symbolSprites: cc.SpriteFrame[], odds: FruitSlotOdds) {
        const ticketDetailItem = cc.instantiate(this.ticketDetailItemPrefab);
        const ticketDetailItemComponent = ticketDetailItem.getComponent(FruitSlotTicketDetailItem);
        this.content.addChild(ticketDetailItem);
        ticketDetailItemComponent.updateContent(betLogDetail, odds, this.settlementResult, symbolSprites, index);
    }
}
