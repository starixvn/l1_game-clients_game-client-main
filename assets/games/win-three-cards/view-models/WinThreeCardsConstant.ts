import { GameConfigBase } from "../../_base/view-models/GameConfigBase";

export class WinThreeCardsConfigs implements GameConfigBase {
    minBetTime = 1;
    fullTime = 45;
    betTime = 30;
    stopBetTime = 5;
    waitTime = 20;
}

export const Choices = {
    dragon: "dragon",
    phoenix: "phoenix",
    pair8Plus: "pair8Plus",
    threeOfAKind: "threeOfAKind",
    straightFlush: "straightFlush",
    flush: "flush",
    straight: "straight"
};

export enum HandRanks {
    highCard = 1,
    onePair,
    straight,
    flush,
    straightFlush,
    threeOfAKind,
    killer235
}

export const hedgeBetChoices = [Choices.dragon, Choices.phoenix];
