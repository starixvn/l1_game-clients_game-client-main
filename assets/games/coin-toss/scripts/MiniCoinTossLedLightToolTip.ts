import { i18n } from "../../../ClientModules";
import MiniRoundHistoryTip from "../../../common/mini-round-history/MiniRoundHistoryTip";
import { BetChoice } from "./MiniCoinTossConstant";

import { findWinningChoice } from "./MiniCoinTossHelper";
const { ccclass } = cc._decorator;

@ccclass
export default class MiniCoinTossLedLightToolTip extends MiniRoundHistoryTip {
    public setData(data: any) {
        this.roundId.string = `#${data.roundId}`;
        const key = findWinningChoice(data?.settlementResult);
        this.result.string = i18n.t(`CoinToss.glossary_${key}`).toUpperCase();
        this.result.node.color = key === BetChoice.Biden ? cc.Color.BLUE : cc.Color.RED;
        this.show();
    }
}
