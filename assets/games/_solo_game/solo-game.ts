import NewGameData from "../_base_new/models/NewGameData";
import StandAloneTableGameBase from "../_base_new/view-models/StandAloneTableGameBase";
import SoloGameData from "./solo-game-data";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SoloGame extends StandAloneTableGameBase {
    createGameData(): NewGameData {
        return new SoloGameData();
    }
}
