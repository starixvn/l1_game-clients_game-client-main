import GameUtils from "../../common/GameUtils";
import { numberWithCommas } from "./../../common/helpers/NumberHelper";
import SlotGameTopWinnerItem from "./SlotGameTopWinnerItem";
import SlotUtils from "./SlotUtils";

const { ccclass } = cc._decorator;

@ccclass
export default class StandardSlotGameTopWinnerItem extends SlotGameTopWinnerItem {
    setOtherValues(player: any, showBigWin: boolean) {
        const { freeSpin, totalAmount, winningAmount, exchangeRateCode, rate, baseTotalAmount, baseWinAmount, pool } = player;

        let amountValue = "";

        if (showBigWin) {
            amountValue = freeSpin
                ? "Free Spin"
                : numberWithCommas(GameUtils.getValueByExchangeRateCode(baseTotalAmount ?? totalAmount * rate, exchangeRateCode), 1);
        } else {
            pool && (amountValue = SlotUtils.formatNamePool(pool));
        }

        this.amount.string = amountValue;

        const winValue = showBigWin ? baseWinAmount ?? winningAmount * rate : winningAmount;
        this.win.string = numberWithCommas(GameUtils.getValueByExchangeRateCode(winValue, exchangeRateCode), 2);
    }
}
