import SevenUpDown from "../SevenUpDown";

export const handlePlacingBet = (game: SevenUpDown) => () => {
    game.highlightLastResult();
};

export const handleBeginStarting = (game: SevenUpDown) => () => {
    game.gameAudios && game.gameAudios.playStartGameAudio();
    game.resetDataAndUI();
    game.highlightLastResult();
};

export const showMultiplier = (game: SevenUpDown) => (data) => {
    game.gameAudios?.playSFXAudio("multiplier");
    game.multiplierComp?.renderMultiplier(data, game.gameConfigs?.multipliers || []);
};

export const clearRoundData = (game: SevenUpDown) => () => {
    game.multiplierComp?.resetMultiplier();
    game.resultComp?.setResultNodeVisibility(false);
};

export const checkShowReachMaxWin = (game: SevenUpDown) => (statusData) => {
    game.handleReachMaxWin(statusData);
};

export const handleFirstLoadRoundHistory = (game: SevenUpDown) => (roundHistory) => {
    if (game.gameData.durations.isPlacingBet() && roundHistory.length > 0) {
        const { result, roundId } = roundHistory[0];
        game.resultComp?.showResultNoAnim(result, roundId);
        game.resultComp?.setResultNodeVisibility(false);
        game.multiplierComp?.resetMultiplier();
    }
};
