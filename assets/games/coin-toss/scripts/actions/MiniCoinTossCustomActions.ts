import MiniCoinToss from "../MiniCoinToss";

export const handlePlacingBet = (game: MiniCoinToss) => () => {
    game.highlightLastResult();
    //game.hideFlipCoinNode();
};

export const handleBeginStarting = (game: MiniCoinToss) => () => {
    game.gameAudios && game.gameAudios.playStartGameAudio();
    game.resetDataAndUI();
    game.highlightLastResult();
    game.handleStartNewRound();
};
