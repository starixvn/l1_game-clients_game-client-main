import StatisticBoard from "../../../common/statistic-board/StatisticBoard";
import { appManager } from "../../../managers/AppManager";
import StandAloneTableGameBase from "../../_base_new/view-models/StandAloneTableGameBase";
import StandAloneTableGameHistory from "../../_base_new/view-models/StandAloneTableGameHistory";
import { Durations } from "../../_new/_base/game-data-management/models/durations";
import { handlePlacingBet, handleShakeDish } from "./actions/FantanCustomActions";
import FantanBetOptionsUI from "./FantanBetOptionsUI";
import FantanBowlAnimation from "./FantanBowlAnimation";
import { FantanConfig, FantanId } from "./FantanConfig";
import FanTanStatBoard from "./FanTanStatBoard";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Fantan extends StandAloneTableGameBase {
    @property(cc.Node)
    animationRootNode: cc.Node = null;

    statisticRoad: StatisticBoard = null;
    animation: FantanBowlAnimation = null;
    startRoundDuration = 7;
    showResultDuration = 6;
    betOptionsUI: FantanBetOptionsUI;
    public usingNewSettlement = true;

    constructor() {
        super();
        this.gameId = FantanId;
        this.setConfig(FantanConfig);
    }

    onLoad() {
        super.onLoad();
        this.animatedTime.setAnimatedY(30, -5);
    }

    initGameDataEvents() {
        super.initGameDataEvents();
        this.emitterListener(this.gameData.durations, Durations.Events.BEGIN_STARTING_ROUND, handleShakeDish);
        this.emitterListener(this.gameData.durations, Durations.Events.PLACING_BET, handlePlacingBet);
    }

    initBowlAnimation(node) {
        const animation = node.getComponent(FantanBowlAnimation);
        if (animation) {
            this.animation = animation;
            this.animation.rootNode = this.animationRootNode;
        }
    }

    initBetItems(node: cc.Node) {
        this.betOptionsUI = node.getComponent(FantanBetOptionsUI);
        this.betOptionsUI.initBetOptions(this);
    }

    openHistory() {
        const dialog = cc.instantiate(this.historyPrefab);
        this.historyComponent = dialog.getComponent(StandAloneTableGameHistory);
        this.historyComponent.init(this.socket);
        this.currentMiniPanel.addDialog(dialog);
    }

    shakeThePlate() {
        const animated = appManager.GAME_IS_SHOWED;
        this.animation.playShakingAnimation(animated);
    }

    async showSettlementResult(settlement: any) {
        const totalBeads = settlement.result.totalBeads;
        this.animation.setNumberOfSeed(totalBeads);
        await this.animation.closeRound();
        try {
            this.gameData.settlement.finishShowResult(settlement, true);
        } catch (error) {
            console.warn(error.message);
        }
    }

    handleAfterSettlementResult(settlement: any, animated: boolean) {
        super.handleAfterSettlementResult(settlement, animated);
        if (!animated) {
            const totalBeads = settlement.result.totalBeads;
            this.animation.showStaticResult(totalBeads);
        }
    }

    initStatisticBoard(node: cc.Node) {
        this.statisticRoad = node.getComponent(FanTanStatBoard);
        this.statisticRoad.setSupportChoices("fan1,fan2,fan3,fan4");
        this.statisticRoad.init(this);
    }
}
