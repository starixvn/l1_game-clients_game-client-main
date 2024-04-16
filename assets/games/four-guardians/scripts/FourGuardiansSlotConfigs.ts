import { SlotGameBaseConfigs } from "../../_slotgame_base/SlotGameBaseConfigs";

export class FourGuardiansSlotConfigs implements SlotGameBaseConfigs {
    itemTypeCount = 11;
    wildSymbol = 9;
    jackpotSymbol = 10;
    showTotalBonusAmountDuration = 3;
    bonusTimeOut = 120;

    normalMode = {
        spinDuration: 0.75,
        winningDuration: 1,
        noWinningDuration: 0.75,
        bigWinDuration: 2,
        freespinDuration: 2,
        bonusDuration: 2,
        jackpotDuration: 4.61,
        showBigWinValueDuration: 1.2,
        delayShowBigWinValue: 0
    };

    turboMode = {
        spinDuration: 0.3,
        winningDuration: 0.75,
        noWinningDuration: 0.5,
        bigWinDuration: 1.5,
        freespinDuration: 1.5,
        bonusDuration: 1.5,
        jackpotDuration: 4.61,
        showBigWinValueDuration: 0.8,
        delayShowBigWinValue: 0
    };
}
