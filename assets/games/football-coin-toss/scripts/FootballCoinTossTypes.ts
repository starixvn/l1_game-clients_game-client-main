export interface IFootballCoinTossResult {
    home: boolean;
    away: boolean;
}

export interface IFootballCoinTossSettlement {
    result: IFootballCoinTossResult;
    settlementResult: IFootballCoinTossResult;
    roundId: number;
}
