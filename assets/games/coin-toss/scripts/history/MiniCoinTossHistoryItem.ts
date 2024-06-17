import { i18n } from "../../../../ClientModules";
import AudioManager from "../../../../common/audio/AudioManager";
import { getStringDateByTime } from "../../../../common/helpers/DateTimeHelper";
import { numberWithCommas } from "../../../../common/helpers/NumberHelper";
import SocketIOHistoryItemBase from "../../../_base/view-models/SocketIOHistoryItemBase";
import { findWinningChoice } from "../MiniCoinTossHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MiniCoinTossHistoryItem extends SocketIOHistoryItemBase {
    @property(cc.Label)
    resultText: cc.Label = null;

    @property(cc.Sprite)
    resultImg: cc.Sprite = null;

    @property(cc.Label)
    totalStake: cc.Label = null;

    public showTicketDetail = (data: any) => {};

    protected data: any;

    setData(betLog: any, symbolsSpriteFrames: cc.SpriteFrame[], index) {
        this.data = betLog;
        this.setBackground(index);
        const { time, betwin, roundId, totalAmount, settlementResult } = betLog;
        this.time.string = getStringDateByTime(time);
        this.round.string = roundId.toString();
        this.win.string = numberWithCommas(betwin, 2);
        this.totalStake.string = numberWithCommas(totalAmount, 2);
        const key = findWinningChoice(settlementResult);
        this.resultText.string = i18n.t(`miniCoinToss.${key}`).toUpperCase();
        this.resultImg.spriteFrame = symbolsSpriteFrames.find((sprite) => sprite.name === `result-${key}`);
    }

    openTicketDetail() {
        AudioManager.getInstance().playClick();
        this.showTicketDetail(this.data);
    }
}
