import { payChips } from "../../_base/action/PayChipsAction";
import FruitSlotChoices from "../event-models/FruitSlotChoices";
import { FruitSlotResult, FruitSlotSettlementResult } from "../FruitSlotType";
import FruitSlot from "../view-models/FruitSlot";
import {
    formatBigSmallResult,
    highlightBigSmallWinning,
    playLedLightAnimation,
    randomNumberAnimation,
    spinItemAnimation,
} from "./FruitSlotWinningAction";

export type FruitSlotFinishModel = {
    result: FruitSlotResult;
    settlementResult: FruitSlotSettlementResult;
    winningPlayers: any[];
    roundId: number;
};

export const handleShowResult = (game: FruitSlot) => (finish: FruitSlotFinishModel) => {
    game.miniRoundHistory.addNextItemHistory();
    game.statistic.addNextItemHistory();
    game.timeHandler.resetNewTime(finish.result);
    game.roundId = finish.roundId + 1;
    game.timeAnimShowResult(true);
    game.timeWaitNode.active = false;
    game.finishShowResult = false;
    const delaySpinAnim = 6.5;

    cc.tween(game?.spinItems)
        .call(() => {
            spinItemAnimation(game)(finish, delaySpinAnim);
            playLedLightAnimation(game.betOptionsUI);
            randomNumberAnimation(game.betOptionsUI)(delaySpinAnim);
        })
        .delay(delaySpinAnim)
        .call(() => {
            highlightBigSmallWinning(game.betOptionsUI)(finish);
            if (game.betOptionsUI && game.betOptionsUI?.bigSmallResult) {
                game.betOptionsUI.bigSmallResult.string = formatBigSmallResult(finish.result.bigSmall.value);
            }
        })
        .start();
};

export const handleAfterSettlementResult = (game: FruitSlot) => (finish: FruitSlotFinishModel) => {
    game.finishShowResult = true;
    game.timeAnimShowResult(false);
    game.statistic.addItem(finish);
    game.miniRoundHistory.addNewItem(finish);
    game.gameData.betModel.ownBets = {};
    game.gameData.totalBetAmount = new FruitSlotChoices();
    payChips(game, transformSettlementResult(finish.settlementResult), finish.winningPlayers, 0.6, 2, true);
};

const transformSettlementResult = (settlementResult: FruitSlotSettlementResult) => {
    return {
        bar: settlementResult.bar || settlementResult.bar25 || settlementResult.bar50,
        tripleSeven: settlementResult.tripleSeven || settlementResult.tripleSeven3,
        star: settlementResult.star || settlementResult.star3,
        watermelon: settlementResult.watermelon || settlementResult.watermelon3,
        bell: settlementResult.bell || settlementResult.bell3,
        lemon: settlementResult.lemon || settlementResult.lemon3,
        orange: settlementResult.orange || settlementResult.orange3,
        cherry: settlementResult.cherry || settlementResult.cherry3,
        big: settlementResult.big,
        small: settlementResult.small
    };
};
