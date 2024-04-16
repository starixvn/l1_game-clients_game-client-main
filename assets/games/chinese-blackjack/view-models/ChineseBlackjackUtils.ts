import { CardModel } from "../../../common/new-card/view-models/NewCard";

export default class ChineseBlackjackUtils {
    public static isBanLuck(cards: CardModel[]): boolean {
        if (cards.length !== 2) {
            return false;
        }

        const [card1, card2] = cards;
        const valueCheck = ["10", "J", "Q", "K"];

        return (valueCheck.includes(card1.rank) && card2.rank === "A") || (valueCheck.includes(card2.rank) && card1.rank === "A");
    }

    public static isBanBan(cards: CardModel[]): boolean {
        return cards.length === 2 && cards.every((card) => card.rank === "A");
    }

    public static isFiveCards(cards: CardModel[], total: number) {
        return total <= 21 && cards.length === 5;
    }

    public static isUnqualified(cards: CardModel[], total: number) {
        return total < 16 && cards.length !== 5 && !this.isBanBan(cards) && !this.isBanLuck(cards);
    }

    public static getValues(rank: string): number[] {
        switch (rank) {
            case "A":
                return [1, 10, 11];
            case "J":
            case "Q":
            case "K":
                return [10];
            default:
                return [+rank];
        }
    }

    public static getTotal(cards: any[], cardNum: number): number[] {
        let total = 0;
        let hasAce = false;

        for (let i = 0; i < cardNum && i < cards.length; i++) {
            const card = cards[i];
            const values = ChineseBlackjackUtils.getValues(card.rank);
            const cardValue = values[0];

            total += cardValue;

            if (card.rank === "A") {
                hasAce = true;
            }
        }

        if (hasAce) {
            if (cardNum >= 4) {
                return [total];
            }

            const possibleTotals = [total, total + 10];
            if (total + 9 === 21) {
                possibleTotals.push(total + 9);
            }

            return possibleTotals.filter((value) => value <= 21);
        }

        return [total];
    }
}
