import { CardModel } from "../../../common/new-card/view-models/NewCard";
import HandPlace from "../../blackjack/view-models/HandPlace";

const { ccclass, property, executeInEditMode } = cc._decorator;
@ccclass
@executeInEditMode
export default class PontoonHandPlace extends HandPlace {
    @property(cc.Node)
    fiveCardsNode: cc.Node = null;

    get canDouble() {
        const { actions, total } = this.data;

        if (actions.includes("double")) {
            return false;
        }

        return total[0] < 21;
    }

    resetView() {
        super.resetView();
        this.fiveCardsNode.active = false;
    }

    showExtraInfoHandPlace(cards: CardModel[], total: number) {
        if (total > 21) {
            this.burstNode.active = true;
            this.showScore(false);
        } else if (this.isBlackJackHandPlace(cards, total)) {
            this.blackJackNode.active = true;
            this.showScore(false);
        } else if (this.isFiveCards(cards, total)) {
            this.fiveCardsNode.active = true;
            this.showScore(false);
        }
    }

    isFiveCards(cards: CardModel[], total: number) {
        return total <= 21 && cards.length === 5;
    }

    isBlackJackHandPlace(cards: CardModel[], total: number): boolean {
        return total === 21 && cards.length === 2;
    }

    showExtraInfoDealerPlace(cards: CardModel[], total: number) {
        this.showExtraInfoHandPlace(cards, total);
    }
}
