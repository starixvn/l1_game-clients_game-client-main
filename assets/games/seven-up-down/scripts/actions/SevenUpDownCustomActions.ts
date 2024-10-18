import SevenUpDown from "../SevenUpDown";

export const handlePlacingBet = (game: SevenUpDown) => () => {
    game.highlightLastResult();
    // game.winningResult?.hideQuickly();
    // game.flipCoin?.setStatusNode(true);
    // game.flipCoin?.hideSkeleton();
    // game.highlightResult?.hide();
};

export const handleBeginStarting = (game: SevenUpDown) => () => {
    game.gameAudios && game.gameAudios.playStartGameAudio();
    game.resetDataAndUI();
    game.highlightLastResult();
    game.handleStartNewRound();
};
