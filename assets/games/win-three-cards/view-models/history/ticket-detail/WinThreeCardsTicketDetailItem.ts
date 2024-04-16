import { i18n } from "../../../../../ClientModules";
import { formatDateTime } from "../../../../../common/helpers/DateTimeHelper";
import { numberWithCommas } from "../../../../../common/helpers/NumberHelper";
import { userManager } from "../../../../../common/user/UserManager";
import GameTicketDetailItemBase from "../../../../_base/view-models/GameTicketDetailItemBase";
import { StringHelper } from "../../WinThreeCardsHelper";
import { WinThreeCardsBetLogDetails, WinThreeCardsOdds, WinThreeCardsSettlementResult } from "../../WinThreeCardsModel";

const { ccclass, property } = cc._decorator;
@ccclass
export default class WinThreeCardsTicketDetailItem extends GameTicketDetailItemBase {
    @property(cc.Label)
    time: cc.Label = null;

    @property(cc.Label)
    choice: cc.Label = null;

    @property(cc.Label)
    odds: cc.Label = null;

    @property(cc.Label)
    amount: cc.Label = null;

    @property(cc.Label)
    win: cc.Label = null;

    updateContent(
        freeBet: boolean,
        betLogDetail: WinThreeCardsBetLogDetails,
        odds: WinThreeCardsOdds,
        settlementResult: WinThreeCardsSettlementResult,
        index: number
    ) {
        this.setBackground(index);
        const { time, choice, amount } = betLogDetail;
        this.time.string = formatDateTime(time);
        this.choice.string = i18n.t(`${StringHelper.winThreeCardsNameSpace}.${choice}`);
        this.odds.string = userManager.fractionalOddsFormat ? numberWithCommas(+odds[choice] - 1, 2) : odds[choice];
        this.amount.string = numberWithCommas(amount);

        const effectiveOdds = freeBet ? odds[choice] - 1 : odds[choice];
        const winningAmount = this.getWinAmount(settlementResult[choice], amount, effectiveOdds, settlementResult.tie);
        this.win.string = numberWithCommas(winningAmount, 2);
        this.setHighlightTicketDetail(winningAmount > amount);
    }

    private getWinAmount(isWinning: boolean, amount: number, effectiveOdds: number, isTie = false) {
        if (isTie) {
            return amount;
        }

        return isWinning ? amount * effectiveOdds : 0;
    }

    setHighlightTicketDetail(highlight: boolean) {
        const color = highlight ? cc.Color.YELLOW : cc.Color.WHITE;
        this.choice.node.color = color;
        this.odds.node.color = color;
        this.amount.node.color = color;
    }
}
