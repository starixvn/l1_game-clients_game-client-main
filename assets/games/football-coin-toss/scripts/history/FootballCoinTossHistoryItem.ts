import { i18n } from "../../../../ClientModules";
import AudioManager from "../../../../common/audio/AudioManager";
import { getStringDateByTime } from "../../../../common/helpers/DateTimeHelper";
import { numberWithCommas } from "../../../../common/helpers/NumberHelper";
import SocketIOHistoryItemBase from "../../../_base/view-models/SocketIOHistoryItemBase";
import { findWinningChoice } from "../FootballCoinTossHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FootballCoinTossHistoryItem extends SocketIOHistoryItemBase {
    @property(cc.Label)
    resultText: cc.Label = null;

    @property(cc.Sprite)
    resultImg: cc.Sprite = null;

    @property(cc.Label)
    totalStake: cc.Label = null;

    @property(cc.SpriteAtlas)
    flagsAtlas: cc.SpriteAtlas = null;

    public showTicketDetail = (data: any) => {};

    protected data: any;

    setData(betLog: any, index) {
        this.data = betLog;
        this.roundId = betLog.roundId;
        this.setBackground(index);
        const { time, betwin, roundId, totalAmount, settlementResult } = betLog;
        this.time.string = getStringDateByTime(time);
        this.round.string = roundId.toString();
        this.win.string = numberWithCommas(betwin, 2);
        this.totalStake.string = numberWithCommas(totalAmount, 2);
        const key = findWinningChoice(settlementResult);
        const teamName = betLog.match[key] ?? key;
        this.resultText.string = i18n.t(`FootballCoinToss.glossary_${teamName}`).toUpperCase();
        this.resultImg.spriteFrame = this.flagsAtlas.getSpriteFrame(`result-${teamName.toLowerCase()}`);
    }

    openTicketDetail() {
        AudioManager.getInstance().playClick();
        this.showTicketDetail(this.data);
    }
}
