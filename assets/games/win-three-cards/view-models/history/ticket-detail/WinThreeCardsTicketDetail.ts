import GameTicketDetailBase from "../../../../_base/view-models/GameTicketDetailBase";
import {
    WinThreeCardsBetData,
    WinThreeCardsBetLogDetails,
    WinThreeCardsOdds,
    WinThreeCardsSettlementResult,
} from "../../WinThreeCardsModel";
import WinThreeCardsHistoryResult from "../WinThreeCardsHistoryResult";
import WinThreeCardsTicketDetailItem from "./WinThreeCardsTicketDetailItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class WinThreeCardsTicketDetail extends GameTicketDetailBase {
    @property(cc.Prefab)
    ticketDetailItemPrefab: cc.Prefab = null;

    @property(cc.Label)
    round: cc.Label = null;

    @property({ type: WinThreeCardsHistoryResult })
    cardResultDragon: WinThreeCardsHistoryResult = null;

    @property({ type: WinThreeCardsHistoryResult })
    cardResultPhoenix: WinThreeCardsHistoryResult = null;

    betLogDetails = null;
    WIDTH_BET_DETAIL_TABLE = 1150;
    HEIGHT_BET_DETAIL_TABLE = 390;

    setData(data: WinThreeCardsBetData) {
        const dragonCards = data.result.dragon;
        const phoenixCards = data.result.phoenix;
        const isDragonWin = data?.settlementResult?.dragon;
        const isPhoenixWin = data?.settlementResult?.phoenix;
        this.round.string = data.phien;
        this.cardResultDragon && this.cardResultDragon.setData(dragonCards, isDragonWin);
        this.cardResultPhoenix && this.cardResultPhoenix.setData(phoenixCards, isPhoenixWin);
    }

    public showBetLogs(data: WinThreeCardsBetData) {
        this.betLogDetails = data.betLogDetails;
        this.node.active = true;

        this.betLogDetails.forEach((betLogDetail: WinThreeCardsBetLogDetails, index: number) => {
            this.buildTicketDetailRow(data.freeBet, betLogDetail, index, data.odds, data.settlementResult);
        });
    }

    private buildTicketDetailRow(
        freeBet: boolean,
        betLogDetail: WinThreeCardsBetLogDetails,
        index: number,
        odds: WinThreeCardsOdds,
        settlementResult: WinThreeCardsSettlementResult
    ) {
        const ticketDetailItem = cc.instantiate(this.ticketDetailItemPrefab);
        const ticketDetailItemComponent = ticketDetailItem.getComponent(WinThreeCardsTicketDetailItem);
        this.content.addChild(ticketDetailItem);
        ticketDetailItemComponent.updateContent(freeBet, betLogDetail, odds, settlementResult, index);
    }
}
