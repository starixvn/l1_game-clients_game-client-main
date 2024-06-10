import { i18n } from "../../../ClientModules";
import MiniRoundHistoryTip from "../../../common/mini-round-history/MiniRoundHistoryTip";
import { BetChoice } from "./MiniCoinTossConstant";
const { ccclass } = cc._decorator;

@ccclass
export default class MiniCoinTossLedLightToolTip extends MiniRoundHistoryTip {
    public setData(data: any) {
        this.roundId.string = `#${data.roundId}`;
        const key = this.findWinningChoice(data);
        this.result.string = i18n.t(`miniCoinToss.${key}`).toUpperCase();
        this.show();
    }

    protected findWinningChoice(dataInfo: any): string {
        const choices = [BetChoice.Trump, BetChoice.Biden];
        return choices.find((choice) => dataInfo.settlementResult[choice]) || "";
    }
}
