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
import { RoundHistory } from "../../_base_new/models/RoundHistory";
import MiniGameBase from "../../_base_new/view-models/MiniGameBase";
import { Durations } from "../../_new/_base/game-data-management/models/durations";
import { clearRoundData, handleBeginStarting, handleFirstLoadRoundHistory, handlePlacingBet } from "./actions/SevenUpDownCustomActions";
import SevenUpDownBetHistory from "./history/SevenUpDownBetHistory";
import { sevenUpDownConfigs, SevenUpDownId } from "./SevenUpDownConfigs";
import SevenUpDownDicesStatistic from "./SevenUpDownDicesStatistic";
import { findWinningChoice } from "./SevenUpDownHelper";
import SevenUpDownMultiplier from "./SevenUpDownMultiplier";
import SevenUpDownResult from "./SevenUpDownResult";
import { ISevenUpDownResult, ISevenUpDownSettlement, ISevenUpDownSettlementResult } from "./SevenUpDownTypes";

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
    multiplierTween: cc.Tween = null;
    showResultDuration = 8;
    isFinishDiceAnim = false;

    private readonly SHOW_EXTRA_PAY_DURATION = 2.46;
    private readonly SHOW_MULTIPLIER_DURATION = 4;
    private readonly TOTAL_SHOW_MULTIPLIER_DURATION = 6;
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
        this.betItems.forEach((betItem) => betItem.resetHighlight());
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
        super.closeGame();
        this.unschedule(this.doLaterPayOutCallback);
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

    initGameDataDurations() {
        super.initGameDataDurations();

        this.gameData.durations.addEvent(Durations.Events.END_EXTRA_ANIMATION, {
            startTimePoint: this.config.fullTime,
            endTimePoint: this.config.fullTime - this.TOTAL_SHOW_MULTIPLIER_DURATION
        });
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
        let dataLogs = this.currentDataLogs;

        if (this.gameData.durations.isBeingSpecificPhase(Durations.Events.END_EXTRA_ANIMATION) && !this.isFinishDiceAnim) {
            dataLogs = this.currentDataLogs.filter((log) => log.roundId !== this.roundId);
        }

        this.miniRoundHistory && this.miniRoundHistory.setData(dataLogs);
        this.statisticHistory && this.statisticHistory.setData(dataLogs);
    }

    resetDataAndUI() {
        super.resetDataAndUI();
        this.multiplierTween?.stop();
        this.spineExtraPaid.node.active = false;
        this.clearWinningBet();
        this.resultComp?.setResultTextVisibility(false);
        this.isFinishDiceAnim = false;
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

        const extraPayMessageDelayTime = !!multiplier ? this.SHOW_EXTRA_PAY_DURATION : 0;
        const multiplierDelayTime = !!multiplier ? this.SHOW_MULTIPLIER_DURATION : 0;

        this.multiplierTween?.stop();
        this.multiplierTween = cc
            .tween(this.node)
            .call(() => {
                if (multiplier) {
                    this.spineExtraPaid.node.active = true;
                    AnimationUtils.playSpine(this.spineExtraPaid, "show");
                }
            })
            .delay(extraPayMessageDelayTime)
            .call(() => {
                if (multiplier) {
                    this.gameAudios?.playSFXAudio("multiplier");
                    this.multiplierComp.multipliersConfigs = this.gameConfigs?.multipliers;
                    this.multiplierComp.renderMultiplier(multiplier, true);
                }
            })
            .delay(multiplierDelayTime)
            .call(async () => {
                await this.showResultAnim(result, roundId);

                if (this.gameData?.settlement?.settlement) {
                    this.gameAudios?.playSFXAudio(this.generateWinningKey(settlement));
                    this.gameData?.settlement?.finishShowResult(this.gameData?.settlement?.settlement, true);
                }
            })
            .start();
    }

    async showResultAnim(result: ISevenUpDownResult, roundId: number) {
        this.gameAudios?.playSFXAudio("dice_shake");
        const prevResult = this.gameData.roundHistory.roundHistory[0]?.result;
        this.resultComp.showResultAnim(prevResult, result, roundId);

        await AnimationUtils.delayTime(this.resultComp?.RESULT_DURATION);

        this.isFinishDiceAnim = true;
    }

    generateMusicWinningKey(result: ISevenUpDownSettlementResult): string {
        const choiceWin = Object.keys(result).find((key) => result[key] === true);
        const language = GameUtils.getCurrentLanguage() || "en";
        return `${choiceWin}_win_${language}`;
    }

    async handleAfterSettlementResult(settlement: ISevenUpDownSettlement, animated: boolean) {
        const isExtraAnimation = this.gameData.durations.isBeingSpecificPhase(Durations.Events.END_EXTRA_ANIMATION);
        const { result, roundId } = settlement;

        !animated && this.multiplierComp?.renderMultiplier(result?.multiplier, false);
        if (!this.isFinishDiceAnim && isExtraAnimation) {
            await this.showResultAnim(result, roundId);
        }

        this.showWinChoiceAndUpdateHistory();

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
            if (!isExtraAnimation) {
                this.resultComp?.showResultNoAnim(result, roundId);
                this.resultComp?.showResultText(result);
            }
        }
    }

    showWinChoiceAndUpdateHistory() {
        this.gameData.roundHistory.update();
        this.updateRoundHistory();

        const { hashValue, rawValue } = this.gameData.resultHash.resultHash;
        if (!hashValue && rawValue) {
            this.gameData.resultHash.updateUI();
        }
    }

    highlightAndPayout(settlement: any) {
        this.betItems.forEach((betItem) => betItem.setHighlight(settlement.settlementResult[betItem.node.name.toLowerCase()], true));
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

    resetMultiplierAndResultText() {
        if (!this.multiplierComp || !this.resultComp) {
            return;
        }
        this.multiplierComp.resetMultiplier(true);
        this.resultComp.setResultTextVisibility(false);
    }
}
