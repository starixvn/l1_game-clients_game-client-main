export interface ICoinTossResult {
    head: boolean;
    tail: boolean;
}

export interface ICoinTossSettlement {
    result: ICoinTossResult;
    settlementResult: ICoinTossResult;
    roundId: number;
}
