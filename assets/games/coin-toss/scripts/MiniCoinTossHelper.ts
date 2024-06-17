import { BetChoice } from "./MiniCoinTossConstant";

export const findWinningChoice = (settlementResult: any): string => {
    const choices = [BetChoice.Trump, BetChoice.Biden];
    return choices.find((choice) => settlementResult[choice]) || "";
};
