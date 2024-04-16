import DataHandler from "../../../_base/handlers/DataHandler";
import WinThreeCardBetItem from "../WinThreeCardBetItem";
import WinThreeCards from "../WinThreeCards";
import { Choices } from "../WinThreeCardsConstant";

export default class WinThreeCardsBetPercentHandler implements DataHandler {
    constructor(protected readonly main: WinThreeCards) {}

    handle(data: any) {
        if (data.betPercentage) {
            const { betPercentage } = data;
            const percentageDragon = Math.round(betPercentage?.dragon ?? 0);
            const percentagePhoenix = betPercentage?.phoenix ? Math.round(100 - percentageDragon) : 0;

            this.main.betItems.forEach((item) => {
                switch (item.node.name) {
                    case Choices.dragon:
                        item.betPercent.string = `${percentageDragon}%`;
                        break;
                    case Choices.phoenix:
                        item.betPercent.string = `${percentagePhoenix}%`;
                        break;
                    default:
                        break;
                }
            });
        }
    }
}

export const clearPercentBet = (betItems: WinThreeCardBetItem[]) => {
    betItems.forEach((item) => {
        item?.betPercent && (item.betPercent.string = `0%`);
    });
};
