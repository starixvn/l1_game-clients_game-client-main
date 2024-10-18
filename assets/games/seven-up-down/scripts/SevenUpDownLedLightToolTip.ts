import { i18n } from "../../../ClientModules";
import MiniRoundHistoryTip from "../../../common/mini-round-history/MiniRoundHistoryTip";
import { findWinningChoice } from "./SevenUpDownHelper";

const { ccclass } = cc._decorator;

@ccclass
export default class SevenUpDownLedLightToolTip extends MiniRoundHistoryTip {
    public setData(data: any) {
        this.roundId.string = `#${data.roundId}`;
        const key = findWinningChoice(data?.settlementResult);
        this.result.string = i18n.t(`SevenUpDown.glossary_${key}`).toUpperCase();
        this.show();
    }
}
