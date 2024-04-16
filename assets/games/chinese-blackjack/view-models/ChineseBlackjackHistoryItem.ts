import GameUtils from "../../../common/GameUtils";
import { getStringDateByTime } from "../../../common/helpers/DateTimeHelper";
import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import { CardModel } from "../../../common/new-card/view-models/NewCard";
import { BetHistoryLog } from "../../_base_new/types/bet-history/BetHistoryModel.";
import BlackJackHistoryItem from "../../blackjack/view-models/BlackJackHistoryItem";
import ChineseBlackjackUtils from "./ChineseBlackjackUtils";

const { ccclass, property } = cc._decorator;

export interface IDataLog extends BetHistoryLog<CardModel[], number> {
    id: number;
    pos: number;
    actions: string[];
    cards: CardModel[];
    total: number;
    softPoints: [];
    bet: number;
    freeBet: boolean;
    name: string;
    rate: number;
    ended: boolean;
}

@ccclass
export default class ChineseBlackjackHistoryItem extends BlackJackHistoryItem {
    @property({ type: cc.Node, override: true, visible: false })
    split: cc.Node = null;

    setData(log: IDataLog) {
        if (!log) {
            return;
        }

        const { time, betwin, id, bet, cards, total, result, settlementResult } = log;
        this.time.string = getStringDateByTime(time);
        this.time.node.color = betwin <= 0 ? cc.Color.WHITE : cc.Color.YELLOW;
        this.handId.string = id.toString();
        this.handId.node.color = betwin <= 0 ? cc.Color.WHITE : cc.Color.YELLOW;
        this.bet.string = numberWithCommas(bet);
        this.win.string = numberWithCommas(betwin, 2);
        this.setUICardsDealer(result, settlementResult);
        this.setUICardsPlayer(cards, total, result);
        this.playerResult.node.color = betwin <= 0 ? cc.Color.WHITE : cc.Color.YELLOW;
    }

    setUICardsDealer(result: CardModel[], settlementResult: number) {
        this.initCards(result, this.dealerCards);
        this.setResult(this.dealerResult, settlementResult, result, false, false);
    }

    setUICardsPlayer(cards: CardModel[], total: number, result: CardModel[]) {
        const isBlackjack = ChineseBlackjackUtils.isBanBan(result) || ChineseBlackjackUtils.isBanLuck(result);
        this.initCards(cards, this.playerCards);
        this.setResult(this.playerResult, total, cards, isBlackjack, true);
    }

    isUnqualifiedCondition(cards: CardModel[], totalNumberCard: number, isBlackjack: boolean, isPlayer: boolean): boolean {
        return ChineseBlackjackUtils.isUnqualified(cards, totalNumberCard) && !isBlackjack && isPlayer;
    }

    setResult(resultLabel: cc.Label, totalNumberCard: number, cards: CardModel[], isBlackjack = false, isPlayer = false) {
        if (!resultLabel) {
            return;
        }

        switch (true) {
            case totalNumberCard > 21:
                resultLabel.string = GameUtils.getText(`ChineseBlackjack.glossary_bust`);
                break;
            case ChineseBlackjackUtils.isBanBan(cards):
                resultLabel.string = GameUtils.getText(`ChineseBlackjack.glossary_hand_ranking_ban-ban`);
                break;
            case ChineseBlackjackUtils.isBanLuck(cards):
                resultLabel.string = GameUtils.getText(`ChineseBlackjack.glossary_hand_ranking_ban-luck`);
                break;
            case ChineseBlackjackUtils.isFiveCards(cards, totalNumberCard):
                resultLabel.string = GameUtils.getText(`ChineseBlackjack.glossary_five-card`);
                break;
            case this.isUnqualifiedCondition(cards, totalNumberCard, isBlackjack, isPlayer):
                resultLabel.string = GameUtils.getText(`ChineseBlackjack.unqualified`);
                break;
            default:
                resultLabel.string = totalNumberCard.toString();
                break;
        }
    }
}
