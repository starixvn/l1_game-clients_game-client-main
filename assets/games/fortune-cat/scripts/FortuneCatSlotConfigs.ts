import { SlotGameBaseConfigs } from "../../_slotgame_base/SlotGameBaseConfigs";

export class FortuneCatSlotConfigs implements SlotGameBaseConfigs {
    itemTypeCount = 11;
    wildSymbol = 9;
    jackpotSymbol = 10;
    showTotalBonusAmountDuration = 3;
    bonusTimeOut = 120;

    normalMode = {
        spinDuration: 0.75,
        winningDuration: 1,
        noWinningDuration: 0.75,
        freespinDuration: 2,
        bonusDuration: 2,
        jackpotDuration: 4.61,

        bigWinDuration: 3,
        showBigWinValueDuration: 1.2,
        delayShowBigWinValue: 0.8
    };

    turboMode = {
        spinDuration: 0.3,
        winningDuration: 0.75,
        noWinningDuration: 0.5,
        freespinDuration: 1.5,
        bonusDuration: 1.5,
        jackpotDuration: 4.61,

        bigWinDuration: 2.5,
        showBigWinValueDuration: 0.8,
        delayShowBigWinValue: 0.67
    };
}
