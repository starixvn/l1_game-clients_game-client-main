export interface ISevenUpDownResult {
    up: boolean;
    down: boolean;
    seven: boolean;
}

export interface ISevenUpDownSettlement {
    result: ISevenUpDownResult;
    settlementResult: ISevenUpDownResult;
    roundId: number;
    multiplier: string;
}
