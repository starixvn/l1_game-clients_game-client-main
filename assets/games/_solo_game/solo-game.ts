import NewGameData from "../_base_new/models/NewGameData";
import StandAloneTableGameBase from "../_base_new/view-models/StandAloneTableGameBase";
import { SoloBetModel } from "./solo-bet-model";
import SoloGameData from "./solo-game-data";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SoloGame extends StandAloneTableGameBase {
    createGameData(): NewGameData {
        return new SoloGameData();
    }

    initGameDataEvents() {
        super.initGameDataEvents();
        this.emitterListener(this.gameData.betModel, SoloBetModel.Events.CONFIRM_BET, () => (bet) => this.onConfirmBet(bet));
    }

    onConfirmBet(bet: any) {
        console.log("onConfirmBet", bet);

        const betData = this.createBetData(bet);
        this.sendSocketData("bet", betData);
    }

    protected createBetData(bet: any) {
        throw new Error("Method not implemented.");
    }

    clickConfirmBet() {
        (this.gameData.betModel as SoloBetModel).confirmBet();
    }
}
