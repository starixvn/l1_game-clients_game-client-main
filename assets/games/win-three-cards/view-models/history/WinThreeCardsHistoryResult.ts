import NewCard from "../../../../common/new-card/view-models/NewCard";
import { convertRank, getCardsResult } from "../WinThreeCardsHelper";
import { WinThreeCardsResult } from "../WinThreeCardsModel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class WinThreeCardsHistoryResult extends cc.Component {
    @property(cc.Label)
    handRank: cc.Label = null;

    @property(cc.Label)
    cardRank: cc.Label = null;

    @property({ type: NewCard })
    cards: NewCard[] = [];

    setData(betData: WinThreeCardsResult, isWin = false) {
        this.handRank.string = getCardsResult(betData.handRankId);
        this.cardRank.string = convertRank(+betData.cardRankId);
        this.setCards(betData.cards);
        this.setHighLightResult(isWin);
    }

    private setHighLightResult(isWin: boolean) {
        if (isWin) {
            this.handRank.node.color = this.cardRank.node.color = cc.Color.YELLOW;
        }
    }
    private setCards(results: any) {
        Object.values(results).forEach((result: any, index) => {
            this.cards[index].setCardOldStyle({
                rank: result.rank,
                suit: result.suit
            });

            this.cards[index].faceUp();
        });
    }
}
