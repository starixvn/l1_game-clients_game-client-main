import { i18n } from "../../../ClientModules";
import AudioManager from "../../../common/audio/AudioManager";
import MiniRoundHistory from "../../../common/mini-round-history/MiniRoundHistory";
import { userManager } from "../../../common/user/UserManager";
import { appManager } from "../../../managers/AppManager";
import MiniPanel from "../../../mini-games-panel/view-models/MiniPanel";
import DataHandler from "../../_base/handlers/DataHandler";
import GameBaseProvablyFairHandler from "../../_base/handlers/GameBaseProvablyFairHandler";
import DynamicAudios from "../../_base/view-models/DynamicAudios";
import MD5Component from "../../_base/view-models/MD5Component";
import ProvablyFairComponent from "../../_base/view-models/provably-fair/ProvablyFairComponent";
import { showStartBetMessage, showStopBetMessage } from "../../_base_new/actions/TimeAction";
import { RoundHistory } from "../../_base_new/models/RoundHistory";
import MiniGameBase from "../../_base_new/view-models/MiniGameBase";
import { Durations } from "../../_new/_base/game-data-management/models/durations";
import { sevenUpDownConfigs, SevenUpDownId } from "./SevenUpDownConfigs";
import SevenUpDownStatistic from "./SevenUpDownStatistic";
import { ISevenUpDownResult, ISevenUpDownSettlement } from "./SevenUpDownTypes";
import SevenUpDownBetHistory from "./history/SevenUpDownBetHistory";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SevenUpDown extends MiniGameBase {
    // @property({ type: MiniCoinTossBetItem, override: true })
    // betItems: MiniCoinTossBetItem[] = [];
    @property({ type: MD5Component, visible: false, override: true })
    md5Component: MD5Component = null;

    @property(cc.Animation)
    animation: cc.Animation = null;

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

    @property({ type: cc.Node })
    winningResultNode: cc.Node = null;

    @property({ type: cc.Node })
    flipCoinNode: cc.Node = null;

    @property({ type: cc.Node })
    highlightResultNode: cc.Node = null;

    @property(cc.JsonAsset)
    gameAudioConfig: cc.JsonAsset = null;

    //public winningResult: MiniCoinTossWinningResult = null;
    //public highlightResult: HighlightResult = null;
    public statisticHistory: SevenUpDownStatistic = null;
    public miniRoundHistory: MiniRoundHistory = null;

    protected betHistory: SevenUpDownBetHistory;
    startRoundDuration = 3;
    protected delayPayoutDuration = 0.5;
    public gameAudios: DynamicAudios;
    private doLaterPayOutCallback = () => {
        // callback
    };

    constructor() {
        super();
        this.gameId = SevenUpDownId;
    }

    protected addHandlers(...handlers: DataHandler[]): void {
        this.provablyFairHandler = new GameBaseProvablyFairHandler(this);
        super.addHandlers(...handlers, this.provablyFairHandler);
    }

    onLoad() {
        super.onLoad();
        this.fetchComponents();
        //this.winningResult.hideQuickly();
        this.animatedTime.setAnimatedY(30, -5);
        this.animatedTime.setRedTime(3);
    }

    onEnable(): void {
        super.onEnable();
        //this.statisticHistory.node.active = true;
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
        //this.highlightResult?.hide();
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

    fetchComponents() {
        //this.winningResult = this.winningResultNode.getComponent(MiniCoinTossWinningResult);
        //this.highlightResult = this.highlightResultNode.getComponent(HighlightResult);
    }

    initMiniPanel(miniPanel: MiniPanel) {
        super.initMiniPanel(miniPanel);
        this.gameId = SevenUpDownId;
        this.setConfig(sevenUpDownConfigs);
    }

    initGameDataEvents() {
        super.initGameDataEvents();
        // this.emitterListener(this.gameData.durations, Durations.Events.BEGIN_STARTING_ROUND, handleBeginStarting);
        // this.emitterListener(this.gameData.durations, Durations.Events.PLACING_BET, handlePlacingBet);
        this.emitterListener(this.gameData.durations, Durations.Events.BEGIN_STARTING_ROUND, showStartBetMessage);
        this.emitterListener(this.gameData.durations, Durations.Events.BEGIN_LOCKING_BET, showStopBetMessage);
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
            //betItem.handleHighlightAnim(!settlementResult[betItem.node.name] && isAnimated);
        });
    }

    public updateRoundHistory() {
        super.updateRoundHistory();
        //this.statisticHistory && this.statisticHistory.setData(this.currentDataLogs);
    }

    resetDataAndUI() {
        super.resetDataAndUI();
        //this.highlightResult?.hide();
        this.clearWinningBet();
    }

    handleStartNewRound() {
        //this.winningResult?.hideQuickly();
        //this.highlightResult?.hide();
    }

    showSettlementResult(settlement: ISevenUpDownSettlement) {
        this.gameAudios?.playEndGameAudio();
        //this.winningResult?.setResult(settlement?.result);
        if (appManager?.GAME_IS_SHOWED) {
            //this.handleAnimResult(settlement?.result);
        }
    }

    // generateWinningKey(result: ICoinTossResult): string {
    //     const key = result?.head ? "head" : "tail";
    //     const language = window?.i18n?.curLang || "en";

    //     return `${key}_${language}`;
    // }

    // async handleAnimResult(result: ICoinTossResult) {
    //     // call into tween because action plays sound resume when the game shows
    //     this.tween(this?.winningResult?.node)
    //         .call(() => {
    //             this.winningResult?.show();
    //         })
    //         .delay(this.winningResult?.durationShowResult)
    //         .call(() => {
    //             if (this.gameData?.settlement?.settlement) {
    //                 this.gameAudios?.playSFXAudio(this.generateWinningKey(result));
    //                 this.gameData?.settlement?.finishShowResult(this.gameData?.settlement?.settlement, true);
    //             }
    //         })
    //         .start();
    // }

    generateMusicWinningKey(result: ISevenUpDownResult): string {
        return Object.keys(result).find((key) => result[key] === true);
    }

    handleAfterSettlementResult(settlement: ISevenUpDownSettlement, animated: boolean) {
        // this.showWinChoiceAndUpdateHistory(settlement);
        const doLaterPayOut = () => {
            //!this?.gameData?.durations?.isPlacingBet() && this.highlightResult?.show(settlement?.result);
            this.highlightWonItems(settlement?.settlementResult);
            animated && this.gameAudios?.playSFXAudio(this.generateMusicWinningKey(settlement?.result));
            !animated && this.gameData?.settlement?.showStatus();
        };

        this.doLaterPayOutCallback = doLaterPayOut;
        if (animated) {
            this.scheduleOnce(this.doLaterPayOutCallback, this.delayPayoutDuration);
        } else {
            this.doLaterPayOutCallback();
        }
    }

    showWinChoiceAndUpdateHistory(settlement: ISevenUpDownSettlement) {
        this.gameData.roundHistory.update();
        this.updateRoundHistory();
        this.gameData.resultHash.updateUI();
        //this.winningResult?.setResult(settlement?.result);
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
        this.statisticHistory = node.getComponent(SevenUpDownStatistic);
        this.emitterListener(this.gameData.roundHistory, RoundHistory.Events.CHANGE, () => () => {
            this.statisticHistory.logControl.nextItemActive = false;
        });
        this.emitterListener(this.gameData.durations, Durations.Events.LOCKING_BET, () => () => {
            this.statisticHistory.logControl.nextItemActive = true;
        });
        this.statisticHistory.init(this);
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
        this.historyComponent.pfGameId = this.gameId;
        this.currentMiniPanel.addDialog(dialog);
    }
}
