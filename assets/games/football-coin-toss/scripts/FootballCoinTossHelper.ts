import { BetChoice } from "./FootballCoinTossConstant";

export const findWinningChoice = (settlementResult: any): string => {
    const choices = [BetChoice.Home, BetChoice.Away];
    return choices.find((choice) => settlementResult[choice]) || "";
};
