import Fantan from "../Fantan";

export const handlePlacingBet = (game: Fantan) => () => {
    game.highlightLastResult();
};

export const handleShakeDish = (game: Fantan) => () => {
    game.gameAudios && game.gameAudios.playStartGameAudio();
    game.resetDataAndUI();
    game.highlightLastResult();
    game.shakeThePlate();
};
