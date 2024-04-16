import { BlockchainBaccaratTimeHandler } from "./../event-handlers/BlockchainBaccaratTimeHandler";
import * as blockchainAction from "./BlockchainBaccaratActions";
import BlockchainBetOptionsUI from "../view-models/BlockchainBetOptionsUI";
import BlockchainBaccaratCardsUI from "../view-models/BlockchainBaccaratCardsUI";
import BlockchainBaccaratLastRoundInfo from "../components/last-round-info/view-models/BlockchainBaccaratLastRoundInfo";
import BlockchainBaccaratScoreboard from "../components/score-board/view-models/BlockchainBaccaratScoreBoard";
import { BlockchainBaccaratCardListModel, BlockchainBaccaratRoundHistory } from "../event-models/BlockchainBaccaratModel";

export const updateWinning =
    (
        betOptionsUI: BlockchainBetOptionsUI,
        cardsUI: BlockchainBaccaratCardsUI,
        timeHandler: BlockchainBaccaratTimeHandler,
        cardList: BlockchainBaccaratCardListModel
    ) =>
    (roundHistory: BlockchainBaccaratRoundHistory[], currentIndex: number) => {
        const lastRound = roundHistory[0];
        const playerCards = Object.values(lastRound.result.player).filter((card) => card != null);
        const bankerCards = Object.values(lastRound.result.banker).filter((card) => card != null);
        const cardsFlied = playerCards.length + bankerCards.length;

        if ((timeHandler.isInWaitTime || timeHandler.isStartingNewGameRound) && !cardsUI.isRunSettle) {
            cardsUI.isRunJoinRoom = true;
            cardList.numberCardsFly = cardsFlied;
            cardsUI.showCardsWithoutAnimation(lastRound, currentIndex, true);
            !timeHandler.isStartingNewGameRound &&
                blockchainAction.showLabelWinning(betOptionsUI, cardsUI)(lastRound.settlementResult, false);
            !timeHandler.isStartingNewGameRound && blockchainAction.showHighLightBet(betOptionsUI)(lastRound.settlementResult, false);
            !timeHandler.isStartingNewGameRound && blockchainAction.showHighlightCards(cardsUI, lastRound.settlementResult);
        }

        if (timeHandler.isInRoundTime) {
            blockchainAction.showHighLightBet(betOptionsUI)(lastRound.settlementResult, false);
        }
    };

export const updateCardDropBox = (cardsUI: BlockchainBaccaratCardsUI) => (currentIndex: number, cutCardIndex: number) => {
    cardsUI.updateCardDropBox(currentIndex, cutCardIndex);
};

export const updateLastRoundInfo =
    (timeHandler: BlockchainBaccaratTimeHandler, lastRoundIfo: BlockchainBaccaratLastRoundInfo) =>
    (roundHistory: BlockchainBaccaratRoundHistory[], currentIndex: number) => {
        const lastRound = roundHistory[0];
        if (timeHandler.isStartingNewGameRound || timeHandler.isInWaitTime) {
            const playerCards = Object.values(lastRound.result.player).filter((card) => card != null);
            const bankerCards = Object.values(lastRound.result.banker).filter((card) => card != null);
            const prevRoundIndex = currentIndex - playerCards.length - bankerCards.length;
            lastRoundIfo.updateUI(roundHistory[1], prevRoundIndex);
        } else {
            lastRoundIfo.updateUI(lastRound, currentIndex);
        }
    };

export const renderScoreboard = (scoreboard: BlockchainBaccaratScoreboard) => (roundHistory: BlockchainBaccaratRoundHistory[]) => {
    scoreboard.renderScoreBoardInGame(roundHistory);
};
