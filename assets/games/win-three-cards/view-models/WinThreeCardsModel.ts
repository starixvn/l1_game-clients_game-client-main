import { CardModel, OldCardModel } from "../../../common/new-card/view-models/NewCard";

export interface WinThreeCardsOdds {
    dragon: number;
    phoenix: number;
    pair8Plus: number;
    threeOfAKind: number;
    straightFlush: number;
    flush: number;
    straight: number;
}

export interface WinThreeCardsBetLogDetails {
    amount: number;
    choice: string;
    time: Date;
}

export class WinThreeCardsSettlementResult {
    dragon: boolean;
    phoenix: boolean;
    tie: boolean;
    threeOfAKind: boolean;
    straightFlush: boolean;
    flush: boolean;
    straight: boolean;
    pair8Plus: boolean;
    killer235: boolean;
    highCard: boolean;
}

export type WinThreeCardsGameResultData = OldCardModel[];

export class WinThreeCardsResult {
    cards: CardModel[];
    cardRankId: number;
    handRankId: number;

    constructor(cardResult: any) {
        this.cardRankId = cardResult.cardRankId;
        this.handRankId = cardResult.handRankId;
        if (cardResult.cards) {
            this.cards = Object.values(cardResult.cards);
        }
    }
}

export interface WinThreeCardsResultCards {
    dragon: WinThreeCardsResult;
    phoenix: WinThreeCardsResult;
}

export interface WinThreeCardsBetData {
    freeBet: boolean;
    betLogDetails: WinThreeCardsBetLogDetails;
    dragon: number;
    phoenix: number;
    pair8Plus: number;
    threeOfAKind: number;
    straightFlush: number;
    flush: number;
    straight: number;
    time: string;
    phien: string;
    betwin: number;
    result: WinThreeCardsResultCards;
    settlementResult: WinThreeCardsSettlementResult;
    odds: WinThreeCardsOdds;
}

export interface WinThreeCardsRoundHistory {
    result: WinThreeCardsResultCards;
    settlementResult: WinThreeCardsSettlementResult;
    roundId: number;
}
