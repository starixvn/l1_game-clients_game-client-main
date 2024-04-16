import { SlotGameBaseConfigs } from "../../_slotgame_base/SlotGameBaseConfigs";

export class DJClubSlotConfigs implements SlotGameBaseConfigs {
    itemTypeCount = 11;
    wildSymbol = 9;
    jackpotSymbol = 10;
    showTotalBonusAmountDuration = 3;
    bonusTimeOut = 120;

    normalMode = {
        spinDuration: 1,
        winningDuration: 2,
        noWinningDuration: 0.75,
        freespinDuration: 2,
        bonusDuration: 2,
        jackpotDuration: 4.61,

        bigWinDuration: 4,
        showBigWinValueDuration: 1,
        delayShowBigWinValue: 0
    };

    turboMode = {
        spinDuration: 0.3,
        winningDuration: 1,
        noWinningDuration: 0.5,
        freespinDuration: 1.5,
        bonusDuration: 1.5,
        jackpotDuration: 4.61,

        bigWinDuration: 3.2,
        showBigWinValueDuration: 0.8,
        delayShowBigWinValue: 0
    };
}
