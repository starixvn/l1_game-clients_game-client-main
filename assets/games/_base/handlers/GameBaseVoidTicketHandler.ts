import GameBase from "../GameBase";
import DataHandler from "./DataHandler";

export default class GameBaseVoidTicketHandler implements DataHandler {
    constructor(protected readonly main: GameBase) {}

    handle(data: any) {
        if (!data.toLobby) {
            return;
        }

        this.main.voidTicket(data.toLobby);
    }
}
