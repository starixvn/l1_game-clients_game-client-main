import { appManager } from "../../../../managers/AppManager";
import GameBaseFinishHandler from "../../../_base/handlers/GameBaseFinishHandler";
import FootballCoinToss from "../FootballCoinToss";

export default class FootballCoinTossFinishHandler extends GameBaseFinishHandler {
    constructor(protected readonly main: FootballCoinToss) {
        super(main, 2.5);
    }
}
