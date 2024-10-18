import { i18n } from "../../../ClientModules";
import MiniRoundHistoryTip from "../../../common/mini-round-history/MiniRoundHistoryTip";
import { findWinningChoice } from "./SevenUpDownHelper";

const { ccclass } = cc._decorator;

@ccclass
export default class SevenUpDownLedLightToolTip extends MiniRoundHistoryTip {
    public setData(data: any) {
        const { result, settlementResult } = data;
        this.roundId.string = `#${data.roundId}`;
        const key = findWinningChoice(settlementResult);
        const choiceWin = i18n.t(`SevenUpDown.glossary_${key}`).toUpperCase();
        const diceResult = `(${result.dice1}-${result.dice2})`;
        this.result.string = `${choiceWin} ${diceResult}`;
        this.show();
    }
}
