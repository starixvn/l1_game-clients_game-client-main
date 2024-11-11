import AnimationUtils from "../../../../common/utils/AnimationUtils";
import { Durations } from "../../../_new/_base/game-data-management/models/durations";
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
    game.multiplierComp?.resetMultiplier(true);
    game.resultComp?.setResultNodeVisibility(false);
};

export const handleFirstLoadRoundHistory = (game: SevenUpDown) => async (roundHistory) => {
    if (game.gameData.durations.isPlacingBet() && roundHistory.length > 0) {
        const { result, roundId } = roundHistory[0];
        game.resultComp?.showResultNoAnim(result, roundId);
        game.resultComp?.setResultNodeVisibility(false);
        game.multiplierComp?.resetMultiplier(false);
    }

    if (game.gameData.durations.isBeingSpecificPhase(Durations.Events.END_EXTRA_ANIMATION)) {
        const roundHistory = game.gameData.roundHistory.roundHistory;
        if (roundHistory.length > 0) {
            const settlement = roundHistory[0];
            game.gameData.settlement.finishShowResult(settlement, false);

            const { hashValue, rawValue } = game?.gameData?.resultHash?.resultHash;
            game.md5Component.updateValue(hashValue);
            await AnimationUtils.delayTime(game.resultComp?.RESULT_DURATION);
            game.md5Component.updateValue(rawValue);
        }
    }
};

export const updateMD5String = (game: SevenUpDown) => (data) => {
    if (!game.md5Component || !data) {
        return;
    }

    if (
        !game.gameData.durations.isBeingSpecificPhase(Durations.Events.END_EXTRA_ANIMATION) &&
        game.gameData.durations.isBeingSpecificPhase(Durations.Events.WAITING)
    ) {
        game.md5Component.updateValue(data?.rawValue);
    } else {
        game.md5Component.updateMD5Data(data);
    }
};
