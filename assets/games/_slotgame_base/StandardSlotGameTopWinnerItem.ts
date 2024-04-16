import { lodash } from "../../ClientModules";
import GameUtils from "../../common/GameUtils";
import { numberWithCommas } from "./../../common/helpers/NumberHelper";
import SlotGameTopWinnerItem from "./SlotGameTopWinnerItem";

const { ccclass } = cc._decorator;

@ccclass
export default class StandardSlotGameTopWinnerItem extends SlotGameTopWinnerItem {
    setOtherValues(player: any, showBigWin: boolean) {
        const { freeSpin, totalAmount, winningAmount, bet, exchangeRateCode, rate, baseTotalAmount, baseWinAmount } = player;
        const { baseStakeLevels, stakeLevels } = this.gameConfigs;
        let amountValue;

        if (showBigWin) {
            amountValue = freeSpin
                ? "Free Spin"
                : numberWithCommas(GameUtils.getValueByExchangeRateCode(baseTotalAmount ?? totalAmount * rate, exchangeRateCode), 1);
        } else {
            const index = lodash.indexOf(baseStakeLevels, bet);
            amountValue = numberWithCommas(stakeLevels[index], 1);
        }

        this.amount.string = amountValue;

        const winValue = showBigWin ? baseWinAmount ?? winningAmount * rate : winningAmount;
        this.win.string = numberWithCommas(GameUtils.getValueByExchangeRateCode(winValue, exchangeRateCode), 2);
    }
}
