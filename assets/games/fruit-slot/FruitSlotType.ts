export type FruitSlotBigSmallResult = {
    value: number;
    choice: string;
};

export type FruitSlotResult = {
    symbols: string[];
    symbolPositions: number[];
    bigSmall: FruitSlotBigSmallResult;
    isLucky: boolean;
};

export type FruitSlotSettlementResult = {
    bar: boolean;
    bar50: boolean;
    bar25: boolean;
    tripleSeven: boolean;
    tripleSeven3: boolean;
    watermelon: boolean;
    watermelon3: boolean;
    star: boolean;
    star3: boolean;
    bell: boolean;
    bell3: boolean;
    orange: boolean;
    orange3: boolean;
    lemon: boolean;
    lemon3: boolean;
    cherry: boolean;
    cherry3: boolean;
    lucky: boolean;
    big: boolean;
    small: boolean;
};

export type FruitSlotSettlementResultText = {
    bar: "bar";
    bar50: "bar50";
    bar25: "bar25";
    tripleSeven: "tripleSeven";
    tripleSeven3: "tripleSeven3";
    watermelon: "watermelon";
    watermelon3: "watermelon3";
    star: "star";
    star3: "star3";
    bell: "bell";
    bell3: "bell3";
    orange: "orange";
    orange3: "orange3";
    lemon: "lemon";
    lemon3: "lemon3";
    cherry: "cherry";
    cherry3: "cherry3";
    lucky: "lucky";
    big: "big";
    small: "small";
};

export enum CountdownAnimationType {
    IDLE = "item_idle",
    PLAY = "item"
}

export type ChipType = {
    betAmount: number;
    betChoice: string;
    durationMoveChip: number;
    startNode: cc.Node;
    totalBet: number;
    isOwnBet: boolean;
    rate: number;
};
