import MiniGameRoundTimer from "../../../mini-games-panel/view-models/MiniGameRoundTimer";
import { coinTossConfigs } from "./MiniCoinTossConfigs";

const { ccclass } = cc._decorator;

@ccclass
export default class MiniCoinTossRoundTimer extends MiniGameRoundTimer {
    betOptions = ["head", "tail"];

    override initGameConfig() {
        this.gameConfig = coinTossConfigs;
    }
}
