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
    game.multiplierComp.renderMultiplier(data, game.gameConfigs?.multipliers || []);
};

export const clearRoundData = (game: SevenUpDown) => () => {
    game.multiplierComp?.resetMultiplier();
    game.resultComp?.setResultNodeVisibility(false);
};

export const checkShowReachMaxWin = (game: SevenUpDown) => (statusData) => {
    game.handleReachMaxWin(statusData);
};
