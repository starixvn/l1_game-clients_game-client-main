import { formatDateTime } from "../../../../../common/helpers/DateTimeHelper";
import { numberWithCommas } from "../../../../../common/helpers/NumberHelper";
import GameTicketDetailItemBase from "../../../../_base/view-models/GameTicketDetailItemBase";
import { FootballSlotSettlementResult } from "../../../FootballSlotType";
import { FootballSlotBetLogDetail, FootballSlotOdds } from "../FootballSlotHistory";

const { ccclass, property } = cc._decorator;
@ccclass
export default class FootballSlotTicketDetailItem extends GameTicketDetailItemBase {
    @property(cc.Label)
    time: cc.Label = null;

    @property(cc.Label)
    odd: cc.Label = null;

    @property(cc.Label)
    amount: cc.Label = null;

    @property(cc.Label)
    win: cc.Label = null;

    @property({ type: cc.Sprite })
    symbol: cc.Sprite = null;

    @property(cc.Node)
    bigSymbol: cc.Node = null;

    @property(cc.Node)
    smallSymbol: cc.Node = null;

    height: number = null;

    updateContent(
        betLogDetail: FootballSlotBetLogDetail,
        odds: FootballSlotOdds,
        settlementResult: FootballSlotSettlementResult,
        symbolsSpriteFrames: cc.SpriteFrame[],
        index: number
    ) {
        this.setBackground(index);
        const { time, choice, amount, subChoices } = betLogDetail;
        const winColor = new cc.Color(255, 246, 100);
        this.time.string = formatDateTime(time);

        ["big", "small"].includes(choice) ? this.updateBigSmallSymbol(choice) : this.updateNormalSymbol(symbolsSpriteFrames, choice);
        const winningChoice = this.getWinningChoice(subChoices, choice, settlementResult);
        this.odd.string = odds[winningChoice];
        this.amount.string = numberWithCommas(amount);

        const winningAmount = settlementResult[winningChoice] ? amount * odds[winningChoice] : 0;
        this.win.string = numberWithCommas(winningAmount, 2);
        this.win.node.color = winningAmount > 0 ? winColor : cc.Color.WHITE;
        this.height = this.node.height;
    }

    private getWinningChoice(subChoices: string[], mainChoice: string, settlementResult: FootballSlotSettlementResult) {
        let choice = mainChoice;
        subChoices?.forEach((c) => {
            settlementResult[c] && (choice = c);
        });
        return choice;
    }

    private updateBigSmallSymbol(choice: string) {
        this.symbol.node.active = false;
        const isBigChoice = choice === "big";
        this.bigSymbol.active = isBigChoice;
        this.smallSymbol.active = !isBigChoice;
    }

    private updateNormalSymbol(symbolsSpriteFrames: cc.SpriteFrame[], choice: string) {
        this.symbol.spriteFrame = symbolsSpriteFrames.find((sprite) => sprite.name === `item_${choice}`);
        this.bigSymbol.active = false;
        this.smallSymbol.active = false;
    }
}
