import GameBase from "../GameBase";
import DataHandler from "./DataHandler";

export default class GameBaseConfigsHandler implements DataHandler {
    constructor(protected readonly main: GameBase) {}

    handle(data: any) {
        if (!data.gameConfigs) {
            return;
        }

        this.main.setGameConfigs(data.gameConfigs);
        this.main.setBoostedChoices(data.gameConfigs?.boostedChoices);
    }
}
