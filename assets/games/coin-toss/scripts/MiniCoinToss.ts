import _ = require("lodash");
import SedieRoundHistory from "../../../common/round-history/sedie/SedieRoundHistory";
import { userManager } from "../../../common/user/UserManager";
import { appManager } from "../../../managers/AppManager";
import MiniPanel from "../../../mini-games-panel/view-models/MiniPanel";
import ProvablyFairComponent from "../../_base/view-models/provably-fair/ProvablyFairComponent";
import { RoundHistory } from "../../_base_new/models/RoundHistory";
import MiniGameBase from "../../_base_new/view-models/MiniGameBase";
import { Durations } from "../../_new/_base/game-data-management/models/durations";
import { handlePlacingBet, handleShakeDish } from "./actions/MegaSedieCustomActions";
import { coinTossConfigs, CoinTossId } from "./MiniCoinTossConfigs";
import MiniCoinTossLedLight from "./MiniCoinTossLedLight";
import MiniCoinTossBetItem from "./MiniCoinTossBetItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MiniCoinToss extends MiniGameBase {
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

    public statisticHistory: SedieRoundHistory = null;
    public miniRoundHistory: MiniCoinTossLedLight = null;
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
        this.animatedTime.setAnimatedY(30, -5);
    }

    initMiniPanel(miniPanel: MiniPanel) {
        super.initMiniPanel(miniPanel);
        this.gameId = CoinTossId;
        this.setConfig(coinTossConfigs);
    }

    initGameDataEvents() {
        super.initGameDataEvents();
        this.emitterListener(this.gameData.durations, Durations.Events.BEGIN_STARTING_ROUND, handleShakeDish);
        this.emitterListener(this.gameData.durations, Durations.Events.PLACING_BET, handlePlacingBet);
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
        });
    }

    public updateRoundHistory() {
        //this.statisticHistory && this.statisticHistory.setData(miniHistoryData.map((d) => d.red));
        this.miniRoundHistory.setData(this.currentDataLogs);
    }

    shakeThePlate() {
        //shakeThePlate
    }

    handleRoundHistory() {
        this.updateRoundHistory();
    }

    showSettlementResult(settlement: any) {
        this.gameAudios && this.gameAudios.playEndGameAudio();
        if (appManager.GAME_IS_SHOWED) {
            this.handleAnimResult();
        }
    }

    handleAnimResult() {
        //handleAnimResult
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
        this.statisticHistory = node.getComponent(SedieRoundHistory);
        this.statisticHistory.logControl.managedByParent = true;
        this.emitterListener(this.gameData.roundHistory, RoundHistory.Events.CHANGE, () => () => {
            this.statisticHistory.logControl.nextItemActive = false;
        });
        this.emitterListener(this.gameData.durations, Durations.Events.LOCKING_BET, () => () => {
            this.statisticHistory.logControl.nextItemActive = true;
        });
    }

    openPlate(animated: boolean) {
        // openPlate
    }

    closePlate(animated = true) {
        //closePlate
    }

    checkCircleCountDown() {
        //checkCircleCountDown
    }

    public sendBetAtChoice(choice: string, bet: number) {
        const betData = {
            clientSeed: _.random(1000, 9999).toString(),
            amount: bet,
            betChoice: choice,
            username: userManager.userName,
            clientSentTime: new Date()
        };

        this.sendSocketData("bet", betData);
    }
}
