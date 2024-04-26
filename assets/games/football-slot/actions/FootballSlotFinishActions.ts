import { payChips } from "../../_base/action/PayChipsAction";
import FootballSlotChoices from "../event-models/FootballSlotChoices";
import { FootballSlotResult, FootballSlotSettlementResult } from "../FootballSlotType";
import FootballSlot from "../view-models/FootballSlot";
import {
    formatBigSmallResult,
    highlightBigSmallWinning,
    playLedLightAnimation,
    randomNumberAnimation,
    spinItemAnimation
} from "./FootballSlotWinningAction";

export type FootballSlotFinishModel = {
    result: FootballSlotResult;
    settlementResult: FootballSlotSettlementResult;
    winningPlayers: any[];
    roundId: number;
};

export const handleShowResult = (game: FootballSlot) => (finish: FootballSlotFinishModel) => {
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
            if (game.betOptionsUI) {
                game.betOptionsUI.setBigSmallResult(formatBigSmallResult(finish.result.bigSmall.value));
            }
        })
        .start();
};

export const handleAfterSettlementResult = (game: FootballSlot) => (finish: FootballSlotFinishModel) => {
    game.finishShowResult = true;
    game.timeAnimShowResult(false);
    game.statistic.addItem(finish);
    game.miniRoundHistory.addNewItem(finish);
    game.gameData.betModel.ownBets = {};
    game.gameData.totalBetAmount = new FootballSlotChoices();
    payChips(game, transformSettlementResult(finish.settlementResult), finish.winningPlayers, 0.6, 2, true);
};

const transformSettlementResult = (settlementResult: FootballSlotSettlementResult) => {
    return {
        cup: settlementResult.cup || settlementResult.cup25 || settlementResult.cup50,
        mascot: settlementResult.mascot || settlementResult.mascot3,
        hostCountry: settlementResult.hostCountry || settlementResult.hostCountry3,
        franceShirt: settlementResult.franceShirt || settlementResult.franceShirt3,
        englandShirt: settlementResult.englandShirt || settlementResult.englandShirt3,
        ball: settlementResult.ball || settlementResult.ball3,
        tickets: settlementResult.tickets || settlementResult.tickets3,
        shoes: settlementResult.shoes || settlementResult.shoes3,
        big: settlementResult.big,
        small: settlementResult.small
    };
};
