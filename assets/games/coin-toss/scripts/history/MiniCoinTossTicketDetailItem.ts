import { i18n } from "../../../../ClientModules";
import { getStringHourByTime } from "../../../../common/helpers/DateTimeHelper";
import { numberWithCommas } from "../../../../common/helpers/NumberHelper";
import SocketIOHistoryItemBase from "../../../_base/view-models/SocketIOHistoryItemBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MiniCoinTossTicketDetailItem extends SocketIOHistoryItemBase {
    @property(cc.Label)
    choice: cc.Label = null;

    @property(cc.Label)
    stake: cc.Label = null;

    @property(cc.Label)
    odds: cc.Label = null;

    setData(log: any, settlementResult: any, odds: any, index: number) {
        const { time, choice, amount } = log;
        this.odds.string = odds[choice];
        const winningAmount = settlementResult[choice] ? amount * odds[choice] : 0;
        this.time.string = getStringHourByTime(time);
        this.choice.string = i18n.t(`miniCoinToss.${choice}`).toUpperCase();
        this.stake.string = numberWithCommas(amount);
        this.win.string = numberWithCommas(winningAmount, 2);
        this.setBackground(index);
    }
}
