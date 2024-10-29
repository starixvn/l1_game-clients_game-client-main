import { getString12HourByTime, getStringDate1 } from "../../../../common/helpers/DateTimeHelper";
import { numberWithCommas } from "../../../../common/helpers/NumberHelper";
import SocketIOHistoryItemBase from "../../../_base/view-models/SocketIOHistoryItemBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SevenUpDownHistoryItem extends SocketIOHistoryItemBase {
    @property(cc.Sprite)
    dicesFrame: cc.Sprite[] = [];

    @property(cc.Label)
    totalStake: cc.Label = null;

    @property(cc.Label)
    winLoss: cc.Label = null;

    @property(cc.SpriteAtlas)
    mainAtlas: cc.SpriteAtlas = null;

    public showTicketDetail = (data) => {};

    protected data: any;

    setData(betLog: any, index) {
        this.data = betLog;
        this.roundId = betLog.roundId;
        this.setBackground(index);
        const { time, betwin, roundId, totalAmount, result } = betLog;
        this.time.string = `${getStringDate1(time)} ${getString12HourByTime(time)}`;
        this.round.string = roundId.toString();
        this.win.string = numberWithCommas(betwin, 2);
        this.totalStake.string = numberWithCommas(totalAmount, 2);
        const winloss = betwin - totalAmount;
        this.winLoss.string = numberWithCommas(winloss, 2);
        this.winLoss.node.color = winloss >= 0 ? cc.Color.WHITE.fromHEX("#F1E344") : cc.Color.WHITE.fromHEX("#EB3D26");

        this.dicesFrame.forEach((dice, index) => {
            const spriteName = `scoreboard_dice_${result[`dice${index + 1}`]}`;
            dice.spriteFrame = this.mainAtlas.getSpriteFrame(spriteName);
        });
    }

    openNewBetDetails() {
        this.showTicketDetail(this.data);
    }
}
