export type BlockchainBaccaratChoicesType = {
    big: number;
    small: number;
    player: number;
    banker: number;
    playerPair: number;
    bankerPair: number;
    tie: number;
};

export type CardModel = { rank: string; suit: number };

export class BlockchainCardModel {
    card: CardModel;
    hashValue: string;
    rawValue: string;
    revealedRawValue: string;
}

export type ResultCards = {
    card1: CardModel;
    card2: CardModel;
    card3?: CardModel;
};
