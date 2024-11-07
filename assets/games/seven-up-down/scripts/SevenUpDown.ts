import { i18n } from "../../../ClientModules";
import AudioManager from "../../../common/audio/AudioManager";
import GameUtils from "../../../common/GameUtils";
import MiniRoundHistory from "../../../common/mini-round-history/MiniRoundHistory";
import { userManager } from "../../../common/user/UserManager";
import AnimationUtils from "../../../common/utils/AnimationUtils";
import { appManager } from "../../../managers/AppManager";
import MiniPanel from "../../../mini-games-panel/view-models/MiniPanel";
import DynamicAudios from "../../_base/view-models/DynamicAudios";
import MD5Component from "../../_base/view-models/MD5Component";
import ProvablyFairComponent from "../../_base/view-models/provably-fair/ProvablyFairComponent";
import { showStartBetMessage, showStopBetMessage } from "../../_base_new/actions/TimeAction";
import { Multiplier } from "../../_base_new/models/Multiplier";
import { RoundHistory } from "../../_base_new/models/RoundHistory";
import MiniGameBase from "../../_base_new/view-models/MiniGameBase";
import { Durations } from "../../_new/_base/game-data-management/models/durations";
import {
    clearRoundData,
    handleBeginStarting,
    handleFirstLoadRoundHistory,
    handlePlacingBet,
    showMultiplier
} from "./actions/SevenUpDownCustomActions";
import SevenUpDownBetHistory from "./history/SevenUpDownBetHistory";
import { sevenUpDownConfigs, SevenUpDownId } from "./SevenUpDownConfigs";
import SevenUpDownDicesStatistic from "./SevenUpDownDicesStatistic";
import { findWinningChoice } from "./SevenUpDownHelper";
import SevenUpDownMultiplier from "./SevenUpDownMultiplier";
import SevenUpDownResult from "./SevenUpDownResult";
import { ISevenUpDownSettlement, ISevenUpDownSettlementResult } from "./SevenUpDownTypes";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SevenUpDown extends MiniGameBase {
    @property({ type: MD5Component, visible: false, override: true })
    md5Component: MD5Component = null;

    @property(cc.Prefab)
    roundHistoryPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    miniRoundHistoryPrefab: cc.Prefab = null;

    @property(cc.Node)
    miniRoundHistoryContainer: cc.Node = null;

    @property({ type: ProvablyFairComponent, visible: false, override: true })
    provablyFairComponent: ProvablyFairComponent = null;

    @property({ type: cc.Label, visible: false, override: true })
    betPercentage: cc.Label[] = [];

    @property(cc.JsonAsset)
    gameAudioConfig: cc.JsonAsset = null;

    @property(SevenUpDownMultiplier)
    multiplierComp: SevenUpDownMultiplier = null;

    @property(cc.Node)
    nodeReachMaxWin: cc.Node = null;

    @property(sp.Skeleton)
    spineExtraPaid: sp.Skeleton = null;

    public statisticHistory: SevenUpDownDicesStatistic = null;
    public miniRoundHistory: MiniRoundHistory = null;
    public resultComp: SevenUpDownResult = null;

    protected betHistory: SevenUpDownBetHistory;
    startRoundDuration = 1;
    protected delayPayoutDuration = 0.5;
    public gameAudios: DynamicAudios;
    showResultDuration = 8;
    private readonly SHOW_MULTIPLIER_DURATION = 3;
    private doLaterPayOutCallback = () => {
        // callback
    };

    constructor() {
        super();
        this.gameId = SevenUpDownId;
    }

    onLoad() {
        super.onLoad();
        this.animatedTime.setAnimatedY(30, -5);
        this.animatedTime.setRedTime(3);
    }

    onEnable(): void {
        super.onEnable();
        this.statisticHistory.node.active = true;
    }

    initOnStart() {
        if (this?.gameAudios) {
            this.gameAudios?.loadAudios(this?.gameAudioConfig);
            this.gameAudios?.preloadAudioConfigs();
        }
    }

    onDisconnected() {
        this.closeGame();
    }

    closeGame() {
        this.clearWinningBet();
        // _.forEach(this.betItems, (item) => {
        //     item.clearBet();
        //     item.resetHighlight();
        // });
        this.unschedule(this.doLaterPayOutCallback);
        super.closeGame();
    }

    onGameHide(): void {
        super.onGameHide();
        this.unschedule(this.doLaterPayOutCallback);
    }

    public toggleShowStatistic() {
        this.statisticHistory.node.active = !this.statisticHistory.node.active;
    }

    initMiniPanel(miniPanel: MiniPanel) {
        super.initMiniPanel(miniPanel);
        this.gameId = SevenUpDownId;
        this.setConfig(sevenUpDownConfigs);
    }

    initGameDataEvents() {
        super.initGameDataEvents();
        this.emitterListener(this.gameData.durations, Durations.Events.BEGIN_STARTING_ROUND, () => () => {
            handleBeginStarting(this)();
            showStartBetMessage(this)({ duration: 0 });
        });
        this.emitterListener(this.gameData.durations, this.startRoundEvent, clearRoundData);
        this.emitterListener(this.gameData.durations, Durations.Events.PLACING_BET, handlePlacingBet);
        this.emitterListener(this.gameData.durations, Durations.Events.BEGIN_LOCKING_BET, showStopBetMessage);
        this.emitterListener(this.gameData.multiplier, Multiplier.Events.CHANGE, showMultiplier);
        this.emitterListener(this.gameData.roundHistory, RoundHistory.Events.FIRST_LOAD, handleFirstLoadRoundHistory);
    }

    getBetChoiceString(choice: string): string {
        return i18n.t(`${this.gameName}.glossary_${choice}`);
    }

    public highlightLastResult() {
        if (this.currentTimeRemaining <= this.config.stopBetTime) {
            return;
        }
        const dataLog = this.currentDataLogs[0];
        dataLog && this.highlightWonItems(dataLog.settlementResult, false);
    }

    private highlightWonItems(settlementResult: any, isAnimated = true) {
        this.betItems.forEach((betItem) => {
            betItem.setHighlight(settlementResult[betItem.node.name], isAnimated);
        });
    }

    isShowingResultLastRound() {
        return this.gameData.durations.isWaiting() || this.gameData.durations.isBeingSpecificPhase(Durations.Events.SHOW_ANIMATION);
    }

    public updateRoundHistory() {
        super.updateRoundHistory();
        this.statisticHistory && this.statisticHistory.setData(this.currentDataLogs);
    }

    resetDataAndUI() {
        super.resetDataAndUI();
        this.clearWinningBet();
    }

    showSettlementResult(settlement: ISevenUpDownSettlement) {
        this.gameAudios?.playEndGameAudio();
        if (appManager?.GAME_IS_SHOWED) {
            this.handleAnimResult(settlement, settlement.roundId);
        }
    }

    generateWinningKey(result: ISevenUpDownSettlement): string {
        const language = window?.i18n?.curLang || "en";
        const key = findWinningChoice(result?.settlementResult);

        return `${key}_${language}`;
    }

    async handleAnimResult(settlement: ISevenUpDownSettlement, roundId: number) {
        const { result } = settlement;
        const multiplier = result?.multiplier;
        const prevResult = this.gameData.roundHistory.roundHistory[0]?.result;

        if (multiplier) {
            this.spineExtraPaid.node.active = true;
            AnimationUtils.playSpine(this.spineExtraPaid, "show");
            await AnimationUtils.delayTime(2.8);
            this.gameAudios?.playSFXAudio("multiplier");
            this.multiplierComp.renderMultiplier(multiplier, this.gameConfigs?.multipliers || []);
            await AnimationUtils.delayTime(this.SHOW_MULTIPLIER_DURATION);
        }
        this.gameAudios?.playSFXAudio("dice_shake");
        this.resultComp.showResultAnim(prevResult, result, roundId);

        await AnimationUtils.delayTime(this.resultComp?.RESULT_DURATION);

        if (this.gameData?.settlement?.settlement) {
            this.gameAudios?.playSFXAudio(this.generateWinningKey(settlement));
            this.gameData?.settlement?.finishShowResult(this.gameData?.settlement?.settlement, true);
        }
    }

    generateMusicWinningKey(result: ISevenUpDownSettlementResult): string {
        const choiceWin = Object.keys(result).find((key) => result[key] === true);
        const language = GameUtils.getCurrentLanguage() || "en";
        return `${choiceWin}_win_${language}`;
    }

    handleAfterSettlementResult(settlement: ISevenUpDownSettlement, animated: boolean) {
        this.showWinChoiceAndUpdateHistory(settlement);
        const doLaterPayOut = () => {
            this.highlightWonItems(settlement?.settlementResult);
            animated && this.gameAudios?.playSFXAudio(this.generateMusicWinningKey(settlement?.settlementResult));
            !animated && this.gameData?.settlement?.showStatus();
        };

        this.doLaterPayOutCallback = doLaterPayOut;
        if (animated) {
            this.scheduleOnce(this.doLaterPayOutCallback, this.delayPayoutDuration);
        } else {
            this.doLaterPayOutCallback();

            const { result, roundId } = settlement;
            this.resultComp.showResultNoAnim(result, roundId);
            this.resultComp.displayTotalPoints(result);
            this.multiplierComp?.renderMultiplier(result?.multiplier, [], false);
        }
    }

    showWinChoiceAndUpdateHistory(settlement: ISevenUpDownSettlement) {
        this.gameData.roundHistory.update();
        this.updateRoundHistory();
        this.gameData.resultHash.updateUI();
    }

    highlightAndPayout(settlement: any) {
        this.betItems.forEach((betItem) => betItem.setHighlight(settlement.settlementResult[betItem.node.name.toLowerCase()], true));
    }

    initMiniRoundHistory(node: cc.Node) {
        this.miniRoundHistory = node.getComponent(MiniRoundHistory);
        this.miniRoundHistory.managedByParent = true;

        this.emitterListener(this.gameData.roundHistory, RoundHistory.Events.CHANGE, () => () => {
            this.miniRoundHistory.nextItemActive = false;
        });
        this.emitterListener(this.gameData.durations, Durations.Events.LOCKING_BET, () => () => {
            this.miniRoundHistory.nextItemActive = true;
        });
    }

    initRoundHistory(node: cc.Node) {
        this.statisticHistory = node.getComponent(SevenUpDownDicesStatistic);
        this.statisticHistory.logView.managedByParent = true;
        this.emitterListener(this.gameData.roundHistory, RoundHistory.Events.CHANGE, () => () => {
            this.statisticHistory.logView.nextItemActive = false;
        });
        this.emitterListener(this.gameData.durations, Durations.Events.LOCKING_BET, () => () => {
            this.statisticHistory.logView.nextItemActive = true;
        });
        this.statisticHistory.init(this);
    }

    initResult(node: cc.Node) {
        this.resultComp = node.getComponent(SevenUpDownResult);
    }

    public sendBetAtChoice(choice: string, bet: number) {
        const betData = {
            amount: bet,
            betChoice: choice,
            username: userManager.userName,
            clientSentTime: new Date()
        };

        this.sendSocketData("bet", betData);
    }

    public openHistory() {
        AudioManager.getInstance().playClick();

        const dialog = cc.instantiate(this.historyPrefab);
        this.historyComponent = dialog.getComponent(SevenUpDownBetHistory);
        this.historyComponent.init(this.socket);
        this.currentMiniPanel.addDialog(dialog);
    }

    handleReachMaxWin(reachMaxWin: boolean) {
        if (reachMaxWin) {
            const notice = cc.instantiate(this.miniNoticePrefab);
            const noticeComponent = notice.getComponent("mini_warning");
            this.updateMiniWarningContent(noticeComponent, i18n.t(`Common.you_reach_max_win`));
            this.nodeReachMaxWin.addChild(notice);
        }
    }

    showStatus(status: any) {
        if (!appManager.GAME_IS_SHOWED) {
            return;
        }

        const { win, bet, reachMaxWin } = status;

        if (win) {
            this.showWinningBet(bet);
            this.updateUserBalance();
            if (reachMaxWin) {
                this.handleReachMaxWin(reachMaxWin);
            }
        }
    }
}
