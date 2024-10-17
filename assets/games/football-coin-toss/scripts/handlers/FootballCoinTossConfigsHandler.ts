import GameBaseConfigsHandler from "../../../_base/handlers/GameBaseConfigsHandler";
import FootballCoinToss from "../FootballCoinToss";

export default class FootballCoinTossConfigsHandler extends GameBaseConfigsHandler {
    constructor(protected readonly main: FootballCoinToss) {
        super(main);
    }
    handle(data: any) {
        super.handle(data);
        if (data.roundHistory) {
            this.main.handleLastMatch(data.roundHistory);
        }
    }
}
