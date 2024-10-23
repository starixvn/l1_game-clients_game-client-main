import { i18n } from "../../../../ClientModules";
import GameUtils from "../../../../common/GameUtils";
import { numberWithCommas } from "../../../../common/helpers/NumberHelper";
import NoticeUtil from "../../../../common/utils/NoticeUtil";
import { appManager } from "../../../../managers/AppManager";
import { Durations } from "../../../_new/_base/game-data-management/models/durations";
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
    const changeLater = game.gameData.durations.isBeingSpecificPhase(Durations.Events.STARTING_ROUND);
    if (game.isDisableGame) {
        return;
    }
    let bidenBetPercentage = betPercentage?.[BetChoice.Home] ?? 0;
    const trumpBetPercentage = betPercentage?.[BetChoice.Away] ?? 0;
    if (changeLater) {
        bidenBetPercentage = 0;
    }
    const isShowProgressDefault = (bidenBetPercentage === 0 && trumpBetPercentage === 0) || changeLater;
    game.updateProgressBarBetPercentage(bidenBetPercentage, isShowProgressDefault);
};

export const addMatchToRoundHistory = (game: FootballCoinToss) => (settlement) => {
    const matchToInsert = getMatchToInsert(game);
    settlement.match = matchToInsert ?? game.match;
};

const isValidMatch = (match) => {
    return match && typeof match.home === "string" && typeof match.away === "string";
};

const getMatchToInsert = (game: FootballCoinToss) => {
    return isValidMatch(game.currentMatch) ? game.currentMatch : null;
};

export const handleNotice = (game: FootballCoinToss) => (notice) => {
    const { errorCode, hedgeBetGroup, minBet, maxBet, gameRoundId, gameTypeId } = notice;
    const gameName = GameUtils.getGameNameString(gameTypeId);
    if (!gameRoundId || gameRoundId === game.roundId) {
        const opt = { gameName, gameRoundId, errorCode, minBet: numberWithCommas(minBet), maxBet: numberWithCommas(maxBet) };

        if (hedgeBetGroup && hedgeBetGroup.length > 0) {
            hedgeBetGroup.forEach((choice, index) => {
                const choiceName = game.match ? game.match[choice] : choice;
                opt[`betChoice${index + 1}`] = i18n.t(`FootballCoinToss.glossary_${choiceName}`);
            });
        }

        const text = NoticeUtil.getLocalizedErrorMessage(errorCode, opt);
        if (text) {
            game.showMiniWarning(text);
        }
    }
};
