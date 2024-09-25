import MiniGameRoundTimer from "../../../mini-games-panel/view-models/MiniGameRoundTimer";
import { footballCoinTossConfigs } from "./FootballCoinTossConfigs";

const { ccclass } = cc._decorator;

@ccclass
export default class FootballCoinTossRoundTimer extends MiniGameRoundTimer {
    betOptions = ["home", "away"];

    override initGameConfig() {
        this.gameConfig = footballCoinTossConfigs;
    }
}
