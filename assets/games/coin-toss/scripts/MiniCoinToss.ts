import { lodash } from "../../../ClientModules";
import { userManager } from "../../../common/user/UserManager";
import { appManager } from "../../../managers/AppManager";
import MiniPanel from "../../../mini-games-panel/view-models/MiniPanel";
import MD5Component from "../../_base/view-models/MD5Component";
import ProvablyFairComponent from "../../_base/view-models/provably-fair/ProvablyFairComponent";
import { BetModel } from "../../_base_new/models/BetModel";
import { RoundHistory } from "../../_base_new/models/RoundHistory";
import MiniGameBase from "../../_base_new/view-models/MiniGameBase";
import { Durations } from "../../_new/_base/game-data-management/models/durations";
import { FlipCoin } from "./FlipCoin";
import { HighlightResult } from "./HighLightResult";
import MiniCoinTossBetItem from "./MiniCoinTossBetItem";
import { CoinTossId, coinTossConfigs } from "./MiniCoinTossConfigs";
import MiniCoinTossLedLight from "./MiniCoinTossLedLight";
import MiniCoinTossRoundHistory from "./MiniCoinTossRoundHistory";
import { MiniCoinTossWinningResult } from "./MiniCoinTossWinningResult";
import { handleBeginStarting, handlePlacingBet, handleUserBetPercentage } from "./actions/MiniCoinTossCustomActions";
import AudioManager from "../../../common/audio/AudioManager";
import MiniCoinTossBetHistory from "./history/MiniCoinTossBetHistory";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MiniCoinToss extends MiniGameBase {
    @property({ type: MD5Component, visible: false })
    md5Component: MD5Component = null;

    @property({ type: MiniCoinTossBetItem, override: true })
    betItems: MiniCoinTossBetItem[] = [];

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

    private winningResult: MiniCoinTossWinningResult = null;
    private flipCoin: FlipCoin = null;
    private highlightResult: HighlightResult = null;
    public statisticHistory: MiniCoinTossRoundHistory = null;
    public miniRoundHistory: MiniCoinTossLedLight = null;

    protected betHistory: MiniCoinTossBetHistory;
    openPlateDuration = 0.5;
    openPlatePos = cc.v2(15, 30);
    startRoundDuration = 2;
    protected delayPayoutDuration = 1;

    constructor() {
        super();
        this.gameId = CoinTossId;
    }

    onGameHide() {
        super.onGameHide();
    }

    onGameShow() {
        super.onGameShow();
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

    public toggleShowStatistic() {
        this.statisticHistory.node.active = !this.statisticHistory.node.active;
    }

    fetchComponents() {
        this.winningResult = this.winningResultNode.getComponent(MiniCoinTossWinningResult);
        this.flipCoin = this.flipCoinNode.getComponent(FlipCoin);
        this.highlightResult = this.highlightResultNode.getComponent(HighlightResult);
    }

    initMiniPanel(miniPanel: MiniPanel) {
        super.initMiniPanel(miniPanel);
        this.gameId = CoinTossId;
        this.setConfig(coinTossConfigs);
    }

    initGameDataEvents() {
        super.initGameDataEvents();
        this.emitterListener(this.gameData.durations, Durations.Events.BEGIN_STARTING_ROUND, handleBeginStarting);
        this.emitterListener(this.gameData.durations, Durations.Events.PLACING_BET, handlePlacingBet);
        this.emitterListener(this.gameData.betModel, BetModel.Events.CHANGE_BET_PERCENTAGE, handleUserBetPercentage);
    }

    clearRoundHistory() {
        this.currentDataLogs = [];
        //this.gameData.roundHistory.clearData();
    }

    public highlightLastResult() {
        if (this.currentTimeRemaining <= this.config.stopBetTime) {
            return;
        }
        const dataLog = this.currentDataLogs[0];
        dataLog && this.highlightWonItems(dataLog.settlementResult, false);
    }

    public setDots(result, roundId) {
        // handle
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
                head: d.result.head
            };
        });

        this.statisticHistory && this.statisticHistory.setData(miniHistoryData);
        this.miniRoundHistory.setData(this.currentDataLogs);
    }

    handleStartNewRound() {
        this.winningResult.hideQuickly();
        this.flipCoin.playAnim();
        this.highlightResult.hide();
    }

    handleRoundHistory() {
        this.updateRoundHistory();
    }

    showSettlementResult(settlement: any) {
        this.gameAudios && this.gameAudios.playEndGameAudio();
        this.flipCoin.setStatusNode(false);
        this.winningResult.setResult(settlement?.result);
        if (appManager.GAME_IS_SHOWED) {
            this.handleAnimResult();
        }
    }

    handleAnimResult() {
        this.tween(this.winningResultNode)
            .call(() => {
                this.winningResult.show();
            })
            .delay(this.showResultDuration)
            .call(() => {
                if (this.gameData?.settlement?.settlement) {
                    this.highlightResult.show(this.gameData?.settlement?.settlement?.result);
                    this.highlightWonItems(this.gameData?.settlement?.settlement?.settlementResult);
                    this.gameData.settlement.finishShowResult(this.gameData.settlement.settlement, true);
                }
            })
            .start();
    }

    handleAfterSettlementResult(settlement: any, animated: boolean) {
        this.showWinChoiceAndUpdateHistory(settlement);

        const doLaterPayOut = () => {
            this.highlightAndPayout(settlement);
            !animated && this.gameData.settlement.showStatus();
        };

        if (animated) {
            this.scheduleOnce(doLaterPayOut, this.delayPayoutDuration);
        } else {
            doLaterPayOut();
        }
    }

    showWinChoiceAndUpdateHistory(settlement: any) {
        this.gameData.roundHistory.update();
        this.updateRoundHistory();
        this.gameData.resultHash.updateUI();
        // this.setDots(settlement.result, settlement.roundId);
    }

    highlightAndPayout(settlement: any) {
        this.betItems.forEach((betItem) => betItem.setHighlight(settlement.settlementResult[betItem.node.name.toLowerCase()], true));
    }

    initMiniRoundHistory(node: cc.Node) {
        this.miniRoundHistory = node.getComponent(MiniCoinTossLedLight);
        this.miniRoundHistory.managedByParent = true;

        this.emitterListener(this.gameData.roundHistory, RoundHistory.Events.CHANGE, () => () => {
            this.miniRoundHistory.nextItemActive = false;
        });
        this.emitterListener(this.gameData.durations, Durations.Events.LOCKING_BET, () => () => {
            this.miniRoundHistory.nextItemActive = true;
        });
    }

    initRoundHistory(node: cc.Node) {
        this.statisticHistory = node.getComponent(MiniCoinTossRoundHistory);
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
            clientSeed: lodash.random(1000, 9999).toString(),
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
        this.historyComponent = dialog.getComponent(MiniCoinTossBetHistory);
        this.historyComponent.init(this.socket);
        this.currentMiniPanel.addDialog(dialog);
    }
}
