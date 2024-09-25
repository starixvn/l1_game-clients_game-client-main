import { appManager } from "../../../../managers/AppManager";
import FootballCoinToss from "../FootballCoinToss";
import { BetChoice } from "../FootballCoinTossConstant";

export const handlePlacingBet = (game: FootballCoinToss) => () => {
    game.highlightLastResult();
    game.winningResult?.hideQuickly();
    game.flipCoin?.setStatusNode(true);
    game.flipCoin?.hideSkeleton();
    game.highlightResult?.hide();
    game.updateCurrentMatch(game.match);
};

export const handleBeginStarting = (game: FootballCoinToss) => () => {
    game.gameAudios && game.gameAudios.playStartGameAudio();
    game.resetDataAndUI();
    game.highlightLastResult();
    game.handleStartNewRound();
};

export const handleUserBetPercentage = (game: FootballCoinToss) => (betPercentage: any) => {
    if (game.isDisableGame) {
        return;
    }
    const bidenBetPercentage = betPercentage?.[BetChoice.Home] ?? 0;
    const trumpBetPercentage = betPercentage?.[BetChoice.Away] ?? 0;
    const isShowProgressDefault = bidenBetPercentage === 0 && trumpBetPercentage === 0;
    game.updateProgressBarBetPercentage(bidenBetPercentage, isShowProgressDefault);
};

export const handleShowResult = (game: FootballCoinToss) => (settlement) => {
    if (game.isDisableGame) {
        return;
    }
    game.inSettlementSequence = true;
    if (game.usingNewSettlement) {
        game.gameData.settlement.clearStatus();
        game.gameData.settlement.clearWinnersData();
    }
    const matchToInsert = getMatchToInsert(game);
    settlement.match = matchToInsert ?? game.match;
    game.gameData.roundHistory.add(settlement);
    game.gameData.roundHistory.checkWinningStreak(settlement, game.showResultDuration);
    game.disableRebetButton();
    if (game.countDownProgressBar) {
        game.animatedTime.node.active = false;
        game.setWaitingDotsVisibility(true);
        game.countDownProgressBar.setIndicatorVisibility(false);
    }

    const isDelayEndGame = game.gameData.durations.isBeforePlacingBet();
    if (isDelayEndGame || !appManager.GAME_IS_SHOWED) {
        game.gameData.settlement.finishShowResult(settlement, false);
    } else {
        game.isShowingSettlementOnUI = true;
        game.showSettlementResult(settlement);
    }
};

const isValidMatch = (match) => {
    return match && typeof match.home === "string" && typeof match.away === "string";
};

const getMatchToInsert = (game: FootballCoinToss) => {
    return isValidMatch(game.currentMatch) ? game.currentMatch : null;
};