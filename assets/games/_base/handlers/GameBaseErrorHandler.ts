import GameBase from "../GameBase";
import DataHandler from "./DataHandler";

export default class GameBaseErrorHandler implements DataHandler {
    constructor(protected readonly main: GameBase) {}

    handle(data: any) {
        if (data.apiError) {
            return;
        }

        if (data.err) {
            this.main.showMiniWarning(data.err);
        }
    }
}
