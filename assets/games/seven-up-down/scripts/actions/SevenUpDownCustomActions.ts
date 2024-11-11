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
    const hasRoundHistory = roundHistory.length > 0;
    if (!hasRoundHistory) return;

    const latestRound = roundHistory[0];

    if (
        game.gameData.durations.isPlacingBet() ||
        game.gameData.durations.isLocking() ||
        game.gameData.durations.isBeingSpecificPhase(Durations.Events.STARTING_ROUND)
    ) {
        handlePlacingBetPhase(game, latestRound);
    }

    if (game.gameData.durations.isBeingSpecificPhase(Durations.Events.END_EXTRA_ANIMATION)) {
        await handleEndExtraAnimationPhase(game, latestRound);
    } else if (game.gameData.durations.isBeingSpecificPhase(Durations.Events.WAITING)) {
        const { rawValue } = game.gameData.resultHash.resultHash;
        game.md5Component.updateValue(rawValue);
    }
};

const handlePlacingBetPhase = (game: SevenUpDown, latestRound: any) => {
    const { result, roundId } = latestRound;
    game.resultComp?.showResultNoAnim(result, roundId);
    game.resultComp?.setResultNodeVisibility(false);
    game.multiplierComp?.resetMultiplier(false);
};

const handleEndExtraAnimationPhase = async (game: SevenUpDown, settlementResult: any) => {
    game.gameData.settlement.finishShowResult(settlementResult, false);

    const { hashValue, rawValue } = game.gameData.resultHash.resultHash;

    if (hashValue) {
        game.md5Component.updateValue(hashValue);
    }

    if (hashValue && rawValue) {
        await AnimationUtils.delayTime(game.resultComp?.RESULT_DURATION);
    }

    if (rawValue) {
        game.md5Component.updateValue(rawValue);
    }
};
