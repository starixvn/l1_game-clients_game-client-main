import { BlockchainBaccaratBetType } from "../event-models/BlockchainBaccaratBetPercentageModel";
import BlockchainBaccaratBetItem from "../view-models/BlockchainBaccaratBetItem";

enum ChoicePercent {
    player = "player",
    banker = "banker",
    tie = "tie"
}

export const handlePercentBet = (betItems: BlockchainBaccaratBetItem[]) => (betPercentage: BlockchainBaccaratBetType) => {
    const percentagePlayer = Math.round(betPercentage?.player ?? 0);
    const percentageBanker = Math.round(betPercentage?.banker ?? 0);
    betItems.forEach((item) => {
        switch (item.node.name) {
            case ChoicePercent.player:
                item.betPercent.string = `${percentagePlayer}%`;
                break;
            case ChoicePercent.banker:
                item.betPercent.string = `${percentageBanker}%`;
                break;
            case ChoicePercent.tie:
                item.betPercent.string = `${betPercentage?.tie ? Math.round(100 - (percentagePlayer + percentageBanker)) : 0}%`;
                break;
            default:
                break;
        }
    });
};

export const clearPercentBet = (betItems: BlockchainBaccaratBetItem[]) => {
    betItems.forEach((item) => {
        item?.betPercent && (item.betPercent.string = `0%`);
    });
};
