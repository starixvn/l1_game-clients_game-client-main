import GameBase from "../GameBase";
import DataHandler from "./DataHandler";

export default class GameBaseConfigsHandler implements DataHandler {
    constructor(protected readonly main: GameBase) {}

    handle(data: any) {
        if (!data.gameConfigs) {
            return;
        }

        // Todo: delete if service finish return data
        // data.gameConfigs["betLevels"] = [0.1, 0.2, 1]; // test data for SC UUS
        data.gameConfigs["betLevels"] = [1, 5, 10]; // test data for VG INH
        this.main.setGameConfigs(data.gameConfigs);
        this.main.setBoostedChoices(data.gameConfigs?.boostedChoices);
    }
}
