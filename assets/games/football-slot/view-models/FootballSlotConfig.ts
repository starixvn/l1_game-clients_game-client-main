import { GameConfigBase } from "./../../_base/view-models/GameConfigBase";

export class FootballSlotConfig implements GameConfigBase {
    minBetTime = 1;
    fullTime = 42;
    betTime = 25;
    stopBetTime = 3;
    waitTime = 20;
}
