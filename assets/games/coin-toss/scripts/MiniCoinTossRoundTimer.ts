import MiniGameRoundTimer from "../../../mini-games-panel/view-models/MiniGameRoundTimer";

const { ccclass } = cc._decorator;

@ccclass
export default class MiniCoinTossRoundTimer extends MiniGameRoundTimer {
    betOptions = ["odd", "even"];

    override initGameConfig() {
        // this.gameConfig = miniSedieConfigs[this.gameId];
    }
}
