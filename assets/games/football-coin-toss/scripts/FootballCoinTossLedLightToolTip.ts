import { i18n } from "../../../ClientModules";
import MiniRoundHistoryTip from "../../../common/mini-round-history/MiniRoundHistoryTip";
import { BetChoice } from "./FootballCoinTossConstant";
import { findWinningChoice } from "./FootballCoinTossHelper";
const { property, ccclass } = cc._decorator;

@ccclass
export default class FootballCoinTossLedLightToolTip extends MiniRoundHistoryTip {
    @property(cc.Node)
    background: cc.Node = null;
    public setData(data: any) {
        const roundIdText = `#${data.roundId}`;
        this.roundId.string = roundIdText;
        const winChoice = findWinningChoice(data?.settlementResult);
        let name = i18n.t(`FootballCoinToss.glossary_${winChoice}`);
        const match = data?.["match"];
        if (match && match[winChoice]) {
            const teamWin = match[winChoice];
            name = i18n.t(`FootballCoinToss.glossary_${teamWin}`);
        }
        this.result.string = name.toUpperCase();
        this.result.node.color = winChoice === BetChoice.Home ? cc.Color.BLUE : cc.Color.RED;
        if (this.background) {
            const letterWidth = 19;
            const roundIdWidth = roundIdText.length * letterWidth;
            let backgroundWidth = (name?.length || 9) * letterWidth;
            backgroundWidth = backgroundWidth > roundIdWidth ? backgroundWidth : roundIdWidth;
            this.background.width = backgroundWidth + 60;
        }

        this.show();
    }
}
