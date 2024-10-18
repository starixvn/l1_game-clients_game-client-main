export const findWinningChoice = (settlementResult: any): string => {
    return Object.keys(settlementResult).find((key) => settlementResult[key] === true);
};
