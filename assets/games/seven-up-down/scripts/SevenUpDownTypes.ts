export interface ISevenUpDownSettlementResult {
    up: boolean;
    down: boolean;
    seven: boolean;
}

export interface ISevenUpDownSettlement {
    result: ISevenUpDownResult;
    settlementResult: ISevenUpDownSettlementResult;
    roundId: number;
    multiplier: string;
}

export interface ISevenUpDownResult {
    dice1: number;
    dice2: number;
}

export enum SevenUpDownChoice {
    UP = "up",
    DOWN = "down",
    SEVEN = "seven"
}
