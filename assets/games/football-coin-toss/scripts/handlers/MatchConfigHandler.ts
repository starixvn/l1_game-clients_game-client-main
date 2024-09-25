import DataHandler from "../../../_base/handlers/DataHandler";
import FootballCoinToss from "../FootballCoinToss";

export default class MatchConfigHandler implements DataHandler {
    constructor(protected readonly main: FootballCoinToss) {}

    handle(data: any) {
        if (data.match) {
            this.main.handleMatch(data.match);
        }
    }
}
