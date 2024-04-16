import AudioManager from "../../../../common/audio/AudioManager";
import GameUtils from "../../../../common/GameUtils";
import BetHistory from "../../../_new/common/BetHistory";
import FootballSlotHistoryItem from "./FootballSlotHistoryItem";
import FootballSlotTicketDetail from "./ticket-detail/FootballSlotTicketDetail";

const { ccclass, property } = cc._decorator;

export interface FootballSlotBetLogDetail {
    amount: number;
    choice: string;
    time: number;
    subChoices: string[];
}

export interface FootballSlotOdds {
    cup: number;
    mascot: number;
    franceShirt: number;
    hostCountry: number;
    englandShirt: number;
    tickets: number;
    ball: number;
    shoes: number;
    big: number;
    small: number;
    cup25: number;
    mascot3: number;
    franceShirt3: number;
    hostCountry3: number;
    englandShirt3: number;
    tickets3: number;
    ball3: number;
    shoes3: number;
    cup50: number;
}

export interface FootballSlotSettlementResult {
    cup: number;
    mascot: number;
    franceShirt: number;
    hostCountry: number;
    englandShirt: number;
    tickets: number;
    ball: number;
    shoes: number;
    big: number;
    small: number;
    lucky: boolean;
}
export interface BetLog {
    time: Date;
    phien: number;
    result: {
        symbols: string[];
        number: number;
        isLucky: boolean;
    };
    totalAmount: number;
    odds: FootballSlotOdds;
    betwin: number;
    betLogDetails: FootballSlotBetLogDetail;
    settlementResult: FootballSlotSettlementResult;
}

@ccclass
export default class FootballSlotHistory extends BetHistory {
    @property(cc.Prefab)
    ticketDetailPrefab: cc.Prefab = null;

    @property(cc.SpriteFrame)
    symbolSprites: cc.SpriteFrame[] = [];

    HEIGHT_CONTENT = 603;

    renderTicketHistory(data: any) {
        const betLogs: BetLog[] = data.betLogs;
        betLogs.forEach((log, index) => {
            const historyItemPrefab = cc.instantiate(this.prefabItem);
            const historyControl = historyItemPrefab.getComponent(FootballSlotHistoryItem);

            historyControl.setData(log, index, this.symbolSprites);
            historyControl.openTicketDetail = () => {
                AudioManager.getInstance().playClick();
                this.initTicketDetail(log);
            };
            this.content.addChild(historyItemPrefab);
        });
    }

    initTicketDetail(data: BetLog) {
        const { betLogDetails, odds, settlementResult } = data;
        const ticketDetailNode = GameUtils.createNodeFromPrefab(this.ticketDetailPrefab);
        this.node.addChild(ticketDetailNode);
        const detailControl = ticketDetailNode.getComponent(FootballSlotTicketDetail);
        detailControl.setData(betLogDetails, settlementResult);
        detailControl.showbetLogs(this.symbolSprites, odds, data);
    }
}
