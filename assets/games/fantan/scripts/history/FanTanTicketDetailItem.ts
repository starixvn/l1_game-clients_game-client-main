import { i18n } from "../../../../ClientModules";
import { getStringDateByTime } from "../../../../common/helpers/DateTimeHelper";
import { numberWithCommas } from "../../../../common/helpers/NumberHelper";
import { userManager } from "../../../../common/user/UserManager";
import GameTicketDetailItemBase from "../../../_base/view-models/GameTicketDetailItemBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FanTanTicketDetailItem extends GameTicketDetailItemBase {
    @property(cc.Label)
    time: cc.Label = null;

    @property(cc.Label)
    odd: cc.Label = null;

    @property(cc.Label)
    betChoice: cc.Label = null;

    @property(cc.Label)
    stake: cc.Label = null;

    @property(cc.Label)
    win: cc.Label = null;

    setData(data: any, choice: string, index: number, isWin: boolean) {
        const choiceText = `fantan.${choice}`;
        this.time.string = getStringDateByTime(data.time);
        this.odd.string = userManager.fractionalOddsFormat ? numberWithCommas(+data.odds[choice] - 1, 2) : data.odds[choice];
        this.betChoice.string = i18n.t(choiceText);
        this.stake.string = numberWithCommas(data[choice], 2);
        this.win.string = isWin ? numberWithCommas(data[choice] * data.odds[choice], 2) : 0;
        this.setBackground(index);
        if (isWin) {
            this.betChoice.node.color = cc.Color.YELLOW;
            this.stake.node.color = cc.Color.YELLOW;
            this.odd.node.color = cc.Color.YELLOW;
        }
    }
}
