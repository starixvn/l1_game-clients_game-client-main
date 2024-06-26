import MiniCoinToss from "../MiniCoinToss";
import { BetChoice } from "../MiniCoinTossConstant";

export const handlePlacingBet = (game: MiniCoinToss) => () => {
    game.highlightLastResult();
    game.winningResult?.hideQuickly();
    game.flipCoin?.setStatusNode(true);
    game.flipCoin?.hideSkeleton();
    game.highlightResult?.hide();
};

export const handleBeginStarting = (game: MiniCoinToss) => () => {
    game.gameAudios && game.gameAudios.playStartGameAudio();
    game.resetDataAndUI();
    game.highlightLastResult();
    game.handleStartNewRound();
};

export const handleUserBetPercentage = (game: MiniCoinToss) => (betPercentage: any) => {
    if (game.isDisableGame) {
        return;
    }
    const bidenBetPercentage = betPercentage?.[BetChoice.Biden] ?? 0;
    const trumpBetPercentage = betPercentage?.[BetChoice.Trump] ?? 0;
    const isShowProgressDefault = bidenBetPercentage === 0 && trumpBetPercentage === 0;
    game.updateProgressBarBetPercentage(bidenBetPercentage, isShowProgressDefault);
};
