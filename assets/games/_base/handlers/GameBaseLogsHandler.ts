import _ = require("lodash");

import GameUtils from "../../../common/GameUtils";
import GameBase from "../GameBase";
import DataHandler from "./DataHandler";

export default class GameBaseLogsHandler implements DataHandler {
    constructor(protected readonly main: GameBase) {}

    handle(data: any) {
        if (data.roundId) {
            this.main.roundId = data.roundId;
            this.main.truthyRoundId = GameUtils.getTruthyRoundId(this.main, data);
        }

        if (data.roundHistory) {
            this.main?.md5Component?.resetMd5();
            this.main.updateRebetButtonStatus();

            const dataLogs = _.cloneDeep(data.roundHistory);
            dataLogs.unshift(...this.main.currentDataLogs);
            this.main.currentDataLogs = dataLogs.filter(
                (log, index, histories) => histories?.findIndex((history) => +history.roundId === +log.roundId) === index
            );

            if (this.main.currentDataLogs.length > 0) {
                this.buildLogs(this.main.currentDataLogs);
            }
        }
    }

    buildLogs(dataLogs) {}
}
