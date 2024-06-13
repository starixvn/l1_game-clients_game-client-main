import { getStringDateByTime } from "../../../../common/helpers/DateTimeHelper";
import { numberWithCommas } from "../../../../common/helpers/NumberHelper";
import SocketIOHistoryItemBase from "../../../_base/view-models/SocketIOHistoryItemBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MiniCoinTossHistoryItem extends SocketIOHistoryItemBase {
    @property(cc.Label)
    lblTotalStake: cc.Label = null;

    @property(cc.Node)
    nodeBackground: cc.Node = null;

    btnRound: cc.Button = null;

    @property(Node)
    result: Node = null;

    setData(betLog: any, index) {
        this.nodeBackground.active = index % 2 > 0;
        const { time, betwin, roundId, totalAmount } = betLog;
        this.time.string = getStringDateByTime(time);
        this.round.string = roundId.toString();
        this.win.string = numberWithCommas(betwin, 2);
        this.lblTotalStake.string = numberWithCommas(totalAmount, 2);
    }
}
