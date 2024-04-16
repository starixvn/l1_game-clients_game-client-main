export type FootballSlotBigSmallResult = {
    value: number;
    choice: string;
};

export type FootballSlotResult = {
    symbols: string[];
    symbolPositions: number[];
    bigSmall: FootballSlotBigSmallResult;
    isLucky: boolean;
};

export type FootballSlotSettlementResult = {
    cup: boolean;
    cup50: boolean;
    cup25: boolean;
    mascot: boolean;
    mascot3: boolean;
    tickets: boolean;
    tickets3: boolean;
    shoes: boolean;
    shoes3: boolean;
    ball: boolean;
    ball3: boolean;
    englandShirt: boolean;
    englandShirt3: boolean;
    franceShirt: boolean;
    franceShirt3: boolean;
    hostCountry: boolean;
    hostCountry3: boolean;
    lucky: boolean;
    big: boolean;
    small: boolean;
};

export type FootballSlotSettlementResultText = {
    cup: "bar";
    cup50: "bar50";
    cup25: "bar25";
    mascot: "tripleSeven";
    mascot3: "tripleSeven3";
    tickets: "watermelon";
    tickets3: "watermelon3";
    shoes: "star";
    shoes3: "star3";
    ball: "bell";
    ball3: "bell3";
    englandShirt: "englandShirt";
    englandShirt3: "englandShirt3";
    franceShirt: "franceShirt";
    franceShirt3: "franceShirt3";
    hostCountry: "hostCountry";
    hostCountry3: "hostCountry3";
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
