import { GameConfigBase } from "../_base/view-models/GameConfigBase";
import SoloGame from "../_solo_game/solo-game";

const { ccclass, property } = cc._decorator;

export class RouletteSConfig implements GameConfigBase {
    minBetTime = 1;
    fullTime = 59;
    betTime = 45;
    stopBetTime = 5;
    waitTime = 15;
}

@ccclass
export default class RouletteS extends SoloGame {
    constructor() {
        super();
        this.gameId = 137;
        this.setConfig(new RouletteSConfig());
    }
}
