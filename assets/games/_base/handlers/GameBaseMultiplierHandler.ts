import GameBase from "../GameBase";
import DataHandler from "./DataHandler";

export default class GameBaseMultiplierHandler implements DataHandler {
    constructor(protected readonly main: GameBase) {}

    handle(data: any) {
        if (data.multiplierValue && data.multiplierChoice) {
            this.main.showMultiplier(data.multiplierValue, data.multiplierChoice);
        }
    }
}
