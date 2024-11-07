import { i18n } from "../../../ClientModules";
import AudioManager from "../../../common/audio/AudioManager";
import GameUtils from "../../../common/GameUtils";
import { userManager } from "../../../common/user/UserManager";
import { appManager } from "../../../managers/AppManager";
import MiniPanel from "../../../mini-games-panel/view-models/MiniPanel";
import DataHandler from "../../_base/handlers/DataHandler";
import GameBaseProvablyFairHandler from "../../_base/handlers/GameBaseProvablyFairHandler";
import DynamicAudios from "../../_base/view-models/DynamicAudios";
import MD5Component from "../../_base/view-models/MD5Component";
import ProvablyFairComponent from "../../_base/view-models/provably-fair/ProvablyFairComponent";
import { showStartBetMessage, showStopBetMessage } from "../../_base_new/actions/TimeAction";
import { BetModel } from "../../_base_new/models/BetModel";
import { NoticeModel } from "../../_base_new/models/NoticeModel";
import { RoundHistory } from "../../_base_new/models/RoundHistory";
import { Settlement } from "../../_base_new/models/Settlement";
import MiniGameBase from "../../_base_new/view-models/MiniGameBase";
import { Durations } from "../../_new/_base/game-data-management/models/durations";
import {
    addMatchToRoundHistory,
    handleBeginStarting,
    handleNotice,
    handlePlacingBet,
    handleUserBetPercentage
} from "./actions/FootballCoinTossCustomActions";
import FootballCoinTossBetItem from "./FootballCoinTossBetItem";
import { footballCoinTossConfigs, FootballCoinTossId } from "./FootballCoinTossConfigs";
import { LastMatchConfig, MatchConfig } from "./FootballCoinTossConstant";
import FootballCoinTossRoundHistory from "./FootballCoinTossRoundHistory";
import { IFootballCoinTossResult, IFootballCoinTossSettlement } from "./FootballCoinTossTypes";
import { FootballCoinTossWinningResult } from "./FootballCoinTossWinningResult";
import { FootballFlipCoin } from "./FootballFlipCoin";
import { FootballHighlightResult } from "./FootballHighLightResult";
import FootballCoinTossConfigsHandler from "./handlers/FootballCoinTossConfigsHandler";
import MatchConfigHandler from "./handlers/MatchConfigHandler";
import FootballCoinTossBetHistory from "./history/FootballCoinTossBetHistory";

const { ccclass, property } = cc._decorator;
export const HOME_AWAY_NAME = "HOME-AWAY";
@ccclass
export default class FootballCoinToss extends MiniGameBase {
    @property({ type: MD5Component, visible: false, override: true })
    md5Component: MD5Component = null;

    @property({ type: FootballCoinTossBetItem, override: true })
    betItems: FootballCoinTossBetItem[] = [];

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

    @property({ type: cc.Node })
    winningResultNode: cc.Node = null;

    @property({ type: cc.Node })
    flipCoinNode: cc.Node = null;

    @property({ type: cc.Node })
    highlightResultNode: cc.Node = null;

    @property(cc.Node)
    headPercentage: cc.Node = null;

    @property(cc.Node)
    tailPercentage: cc.Node = null;

    @property(cc.Node)
    nodePercentageLayout: cc.Node = null;

    @property(cc.JsonAsset)
    gameAudioConfig: cc.JsonAsset = null;
    protected matchHandler: MatchConfigHandler;
    public winningResult: FootballCoinTossWinningResult = null;
    public flipCoin: FootballFlipCoin = null;
    public highlightResult: FootballHighlightResult = null;
    public statisticHistory: FootballCoinTossRoundHistory = null;
    protected betHistory: FootballCoinTossBetHistory;
    startRoundDuration = 3;
    protected delayPayoutDuration = 0.5;
    public gameAudios: DynamicAudios;
    private doLaterPayOutCallback = () => {
        // callback
    };

    public match: MatchConfig;
    public currentMatch: MatchConfig;
    private nextMatchSkeleton: sp.SkeletonData;

    public lastMatch: LastMatchConfig;
    private readonly pathAnimTossDefault = `animations/flip-coin/${HOME_AWAY_NAME}/toss/coin_toss`;

    private readonly BUNDLE_NAME = "93";
    constructor() {
        super();
        this.gameId = FootballCoinTossId;
    }

    protected addHandlers(...handlers: DataHandler[]): void {
        this.provablyFairHandler = new GameBaseProvablyFairHandler(this);
        this.matchHandler = new MatchConfigHandler(this);
        this.configsHandler = new FootballCoinTossConfigsHandler(this);
        super.addHandlers(...handlers, this.provablyFairHandler, this.matchHandler, this.configsHandler);
    }

    onLoad() {
        super.onLoad();
        this.fetchComponents();
        this.winningResult.hideQuickly();
        this.flipCoin.init();
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
        this.highlightResult?.hide();
        this.unschedule(this.doLaterPayOutCallback);
        super.closeGame();
        AudioManager.getInstance().playClick();
    }

    onGameHide(): void {
        super.onGameHide();

        this.unschedule(this.doLaterPayOutCallback);
    }

    public toggleShowStatistic() {
        AudioManager.getInstance().playClick();
        this.statisticHistory.node.active = !this.statisticHistory.node.active;
    }

    fetchComponents() {
        this.winningResult = this.winningResultNode.getComponent(FootballCoinTossWinningResult);
        this.flipCoin = this.flipCoinNode.getComponent(FootballFlipCoin);
        this.highlightResult = this.highlightResultNode.getComponent(FootballHighlightResult);
    }

    initMiniPanel(miniPanel: MiniPanel) {
        super.initMiniPanel(miniPanel);
        this.gameId = FootballCoinTossId;
        this.setConfig(footballCoinTossConfigs);
    }

    initGameDataEvents() {
        super.initGameDataEvents();
        this.emitterListener(this.gameData.durations, Durations.Events.BEGIN_STARTING_ROUND, handleBeginStarting);
        this.emitterListener(this.gameData.durations, Durations.Events.PLACING_BET, handlePlacingBet);
        this.emitterListener(this.gameData.durations, Durations.Events.BEGIN_STARTING_ROUND, handleUserBetPercentage);
        this.emitterListener(this.gameData.betModel, BetModel.Events.CHANGE_BET_PERCENTAGE, handleUserBetPercentage);
        this.emitterListener(this.gameData.durations, Durations.Events.BEGIN_STARTING_ROUND, showStartBetMessage);
        this.emitterListener(this.gameData.durations, Durations.Events.BEGIN_LOCKING_BET, showStopBetMessage);
        this.emitterListener(this.gameData.settlement, Settlement.Events.SHOW_RESULT, addMatchToRoundHistory);
        this.emitterListener(this.gameData.roundHistory, RoundHistory.Events.FIRST_LOAD, () => () => {
            const lastRound = this.gameData.roundHistory?.roundHistory?.[0];
            if (lastRound && this.gameData.durations.isWaiting()) {
                this.betItems.forEach((betItem) => {
                    betItem.setTeam(this.lastMatch);
                });
            } else {
                this.renderStaticBetItem();
            }
        });
        this.emitterListener(this.gameData.notice, NoticeModel.Events.CHANGE, handleNotice);
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
            betItem.handleHighlightAnim(!settlementResult[betItem.node.name] && isAnimated);
        });
    }

    public updateRoundHistory() {
        const miniHistoryData = this.currentDataLogs.map((d) => {
            return {
                home: d.result.home
            };
        });
        this.statisticHistory && this.statisticHistory.setData(miniHistoryData);
        this.miniRoundHistory?.setData(this.currentDataLogs);
    }

    resetDataAndUI() {
        super.resetDataAndUI();
        this.highlightResult?.hide();
        this.flipCoin?.hideSkeleton();
        this.clearWinningBet();
    }

    handleStartNewRound() {
        this.winningResult?.hideQuickly();
        if (this.nextMatchSkeleton) {
            this.flipCoin?.setSkeletonData(this.nextMatchSkeleton);
            this.flipCoin?.playAnim();
            this.winningResult?.setSkeletonData(this.nextMatchSkeleton);
        }
        this.highlightResult?.hide();
        this.renderStaticBetItem();
    }

    handleRoundHistory() {
        this.updateRoundHistory();
    }

    showSettlementResult(settlement: IFootballCoinTossSettlement) {
        this.gameAudios?.playEndGameAudio();
        this.flipCoin?.setStatusNode(false);
        this.winningResult?.setResult(settlement?.result);
        if (appManager?.GAME_IS_SHOWED) {
            this.handleAnimResult(settlement?.result);
        }
    }

    generateWinningKey(result: IFootballCoinTossResult): string {
        const key = result?.home ? "home" : "away";
        const language = window?.i18n?.curLang || "en";
        const winOptionName = this.match ? this.match[key]?.toLowerCase() : key;
        return `${winOptionName}_${language}`;
    }

    async handleAnimResult(result: IFootballCoinTossResult) {
        // call into tween because action plays sound resume when the game shows
        this.tween(this?.winningResult?.node)
            .call(() => {
                this.winningResult?.show();
            })
            .delay(this.winningResult?.durationShowResult)
            .call(() => {
                if (this.gameData?.settlement?.settlement) {
                    this.gameAudios?.playSFXAudio(this.generateWinningKey(result));
                    this.gameData?.settlement?.finishShowResult(this.gameData?.settlement?.settlement, true);
                }
            })
            .start();
    }

    generateMusicWinningKey(result: IFootballCoinTossResult): string {
        return result?.home ? "head_music" : "tail_music";
    }

    handleAfterSettlementResult(settlement: IFootballCoinTossSettlement, animated: boolean) {
        this.flipCoin?.setStatusNode(false);
        this.showWinChoiceAndUpdateHistory(settlement);
        const doLaterPayOut = () => {
            !this?.gameData?.durations?.isPlacingBet() && this.highlightResult?.show(settlement?.result);
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

    showWinChoiceAndUpdateHistory(settlement: IFootballCoinTossSettlement) {
        this.gameData.roundHistory.update();
        this.updateRoundHistory();
        this.gameData.resultHash.updateUI();
        this.winningResult?.setResult(settlement?.result);
    }

    highlightAndPayout(settlement: any) {
        this.betItems.forEach((betItem) => betItem.setHighlight(settlement.settlementResult[betItem.node.name.toLowerCase()], true));
    }

    initRoundHistory(node: cc.Node) {
        this.statisticHistory = node.getComponent(FootballCoinTossRoundHistory);
        this.statisticHistory.logControl.managedByParent = true;
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
            clientSeed: this.provablyFairComponent.getClientSeed(),
            amount: bet,
            betChoice: choice,
            username: userManager.userName,
            clientSentTime: new Date()
        };

        this.sendSocketData("bet", betData);
    }

    updateProgressBarBetPercentage(progress: number, isShowProgressDefault: boolean) {
        this.nodePercentageLayout.active = !isShowProgressDefault;
        const widthDefault = this.nodePercentageLayout.width;
        if (this.nodePercentageLayout) {
            const [headNode, tailNode] = this.nodePercentageLayout.children;
            if (headNode && tailNode) {
                headNode.width = progress * (widthDefault / 100);
                tailNode.width = widthDefault - headNode.width;
            }
        }
    }

    public openHistory() {
        AudioManager.getInstance().playClick();

        const dialog = cc.instantiate(this.historyPrefab);
        this.historyComponent = dialog.getComponent(FootballCoinTossBetHistory);
        this.historyComponent.init(this.socket);
        this.historyComponent.pfGameId = this.gameId;
        this.currentMiniPanel.addDialog(dialog);
    }

    onClickProvablyFair() {
        AudioManager.getInstance().playClick();
        super.onClickProvablyFair();
        this.socket?.connected && this.socket.emit("getRoundPF", { roundId: this.roundId });
    }

    handleMatch(match: MatchConfig) {
        this.match = match;
        this.updateMatch(match);
        this.statisticHistory.updateTeamName(match);
    }

    handleLastMatch(roundHistories: any) {
        if (roundHistories && roundHistories.length > 0) {
            const { match, roundId } = roundHistories[0];
            const lastMatch = {
                home: match?.home,
                away: match?.away,
                roundId
            };
            this.lastMatch = lastMatch;
        }
    }

    updateMatch(match: MatchConfig) {
        if (match.home && match.away) {
            this.match = match;
            this.loadMatchSkeleton(this.match);
        }
    }

    updateCurrentMatch(match: MatchConfig) {
        if (match?.home && match?.away) {
            this.currentMatch = match;
        }
    }

    async loadMatchSkeleton(match: MatchConfig) {
        if (match?.home && match?.away) {
            const resourcePath = `${match?.home.toUpperCase()}-${match?.away.toUpperCase()}`;
            await this.loadResourcesAnim(resourcePath);
        }
    }

    async loadResourcesAnim(resourcePath: string) {
        const customPath = `animations/flip-coin/${resourcePath}/toss/coin_toss`;

        try {
            const skeletonData = await this.loadSkeletonData(customPath);
            skeletonData && this.updateSkeletonData(skeletonData);
        } catch (error) {
            cc.log("Not found skeleton data into path: ", resourcePath, error.message);
            const skeletonData = await this.loadSkeletonData(this.pathAnimTossDefault);
            skeletonData && this.updateSkeletonData(skeletonData);
        }
    }
    private async loadSkeletonData(path: string): Promise<sp.SkeletonData | null> {
        try {
            const skeletonData = await GameUtils?.loadAssetsFromBundle<sp.SkeletonData>(this.BUNDLE_NAME, path, sp.SkeletonData, null);

            return (
                skeletonData ?? (await GameUtils?.loadAssetsFromBundle(this.BUNDLE_NAME, this.pathAnimTossDefault, sp.SkeletonData, null))
            );
        } catch (error) {
            cc.log("Failed to load skeleton data from path: ", path, error.message);
            return null;
        }
    }

    private updateSkeletonData(skeletonData: sp.SkeletonData) {
        if (!this.nextMatchSkeleton) {
            this.winningResult.setSkeletonData(skeletonData);
            this.flipCoin.setSkeletonData(skeletonData);
        }

        if (skeletonData) {
            this.nextMatchSkeleton = skeletonData;
        }
    }

    public renderStaticBetItem() {
        this.betItems.forEach((betItem) => {
            betItem.setTeam(this.match);
        });
    }

    openGuide() {
        super.openGuide();
        AudioManager.getInstance().playClick();
    }
}
