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

export const clearRoundData = (game: SevenUpDown) => () => {
    game.resetMultiplierAndResultText(true);
};

export const handleFirstLoadRoundHistory = (game: SevenUpDown) => (roundHistory) => {
    const hasRoundHistory = roundHistory.length > 0;

    if (!hasRoundHistory || !game.resultComp || !game.md5Component) {
        return;
    }

    const latestRound = roundHistory[0];

    if (
        game.gameData.durations.isPlacingBet() ||
        game.gameData.durations.isLocking() ||
        game.gameData.durations.isBeingSpecificPhase(Durations.Events.STARTING_ROUND)
    ) {
        showPrevResultAndResetData(game, latestRound);
        return;
    }

    const { rawValue } = game.gameData.resultHash.resultHash;
    if (
        game.gameData.durations.isBeingSpecificPhase(Durations.Events.SHOW_ANIMATION) &&
        !game.gameData.durations.isBeingSpecificPhase(Durations.Events.END_EXTRA_ANIMATION)
    ) {
        game.md5Component.updateValue(rawValue);
        return;
    }

    if (game.gameData.durations.isBeingSpecificPhase(Durations.Events.END_EXTRA_ANIMATION)) {
        if (game.isDisableGame) {
            const { result, roundId } = latestRound;
            game.resultComp.showResultNoAnim(result, roundId);
            game.resultComp.showResultText(result);
            game.md5Component.updateValue(rawValue);
            return;
        }

        handleResultAndMd5(game, latestRound);
        return;
    }

    if (
        game.gameData.durations.isBeingSpecificPhase(Durations.Events.WAITING) ||
        game.gameData.durations.isBeingSpecificPhase(Durations.Events.STARTING_ROUND)
    ) {
        game.md5Component.updateValue(rawValue);
        game.md5Component.setCaptionAndHintForMD5(true);
    }
};

const showPrevResultAndResetData = (game: SevenUpDown, latestRound: any) => {
    const { result, roundId } = latestRound;
    game.resultComp.showResultNoAnim(result, roundId);
    game.resetMultiplierAndResultText(false);
};

const handleResultAndMd5 = async (game: SevenUpDown, settlementResult: any) => {
    game.gameData.settlement.finishShowResult(settlementResult, false);

    const { hashValue, rawValue } = game.gameData.resultHash.resultHash;

    if (hashValue) {
        game.md5Component.updateValue(hashValue);
        game.md5Component.setCaptionAndHintForMD5(false);
    }

    if (hashValue && rawValue) {
        await AnimationUtils.delayTime(game.resultComp?.RESULT_DURATION);
    }

    if (rawValue) {
        game.md5Component.updateValue(rawValue);
        game.md5Component.setCaptionAndHintForMD5(true);
    }
};
