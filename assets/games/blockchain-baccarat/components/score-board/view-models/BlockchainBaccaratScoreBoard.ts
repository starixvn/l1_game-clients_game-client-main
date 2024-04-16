import { scoreBoard } from "../../../../../ClientModules";
import AudioManager from "../../../../../common/audio/AudioManager";
import { BlockchainBaccaratRoundHistory } from "../../../event-models/BlockchainBaccaratRoundHistory";
import BlockchainBaccaratBeadRoad from "./BlockchainBaccaratBeadRoad";
import BlockChainBaccaratBigRoad from "./BlockchainBaccaratBigRoad";
import BlockchainBaccaratDerivedScoreboard from "./BlockchainBaccaratDerivedScoreboard";
import { BlockchainBaccaratPrediction } from "./BlockchainBaccaratPrediction";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BlockchainBaccaratScoreboard extends cc.Component {
    @property([BlockChainBaccaratBigRoad])
    bigRoads: BlockChainBaccaratBigRoad[] = [];

    @property([BlockchainBaccaratDerivedScoreboard])
    derivedScoreboards: BlockchainBaccaratDerivedScoreboard[] = [];

    @property(BlockchainBaccaratBeadRoad)
    beadRoad: BlockchainBaccaratBeadRoad = null;

    @property(BlockchainBaccaratPrediction)
    prediction: BlockchainBaccaratPrediction = null;

    @property(cc.Node)
    statistic: cc.Node = null;

    derivedScoreBoardController: any;

    private roundHistory: BlockchainBaccaratRoundHistory[] = [];
    private bigRoadData: any[][];
    private predictData = { player: [], banker: [] };
    private isFirstLoad = true;

    private readonly zoomModes = {
        normal: "normal",
        zoomInBigRoad: "zoomInBigRoad",
        zoomInDerivedScoreboards: "zoomInDerivedScoreboards"
    };

    private readonly statisticChildrenName = {
        player: "player",
        banker: "banker",
        tie: "tie",
        playerPair: "playerPair",
        bankerPair: "bankerPair",
        big: "big",
        small: "small"
    };

    protected onLoad(): void {
        this.derivedScoreBoardController = new scoreBoard.DerivedScoreboards({ height: 6 });
    }

    protected start(): void {
        this.zoom(undefined, this.zoomModes.normal);
        this.isFirstLoad = false;
    }

    resetScoreboard(): void {
        this.roundHistory = [];
        this.bigRoadData = [];
        this.predictData = { player: [], banker: [] };
        this.bigRoads.forEach((board) => {
            board.resetBoard();
        });
        this.derivedScoreboards.forEach((scoreboard) => {
            scoreboard.resetBoard();
        });
        this.beadRoad.resetBoard();
        this.prediction.resetItem();
        this.resetStatistic();
    }

    renderScoreBoardInGame(roundHistory: BlockchainBaccaratRoundHistory[]) {
        this.roundHistory = roundHistory;
        this.bigRoads.forEach((board) => {
            board.renderScoreBoardInGame(roundHistory);
        });
        this.bigRoadData = this.bigRoads[0].getData();
        this.renderDerivedScoreboard();
        this.beadRoad.render([...roundHistory]);
        this.renderPrediction();
        this.renderStatistic();
    }

    renderScoreBoardEachRound(lastRound: BlockchainBaccaratRoundHistory) {
        this.roundHistory.unshift(lastRound);
        this.bigRoads.forEach((board) => {
            board.renderScoreBoardInGame(this.roundHistory);
        });
        this.bigRoadData = this.bigRoads[0].getData();
        this.renderDerivedScoreboard();
        this.beadRoad.addNewItem(lastRound);
        this.renderPrediction();
        this.renderStatistic();
    }

    renderNextNode() {
        this.bigRoads.forEach((board) => {
            board.renderNextNode();
        });
        this.derivedScoreboards.forEach((board, index) => {
            this.predictData.player[index % 3] !== undefined && board.renderNextNode();
        });
        this.beadRoad.addNextNode();
    }

    private renderDerivedScoreboard() {
        this.derivedScoreBoardController.update(this.bigRoadData);
        this.derivedScoreboards.forEach((scoreboard) => {
            const data = this.derivedScoreBoardController.getScoreboardData(scoreboard.nameBoard as any);
            scoreboard.renderScoreBoard(data);
        });
    }

    private renderPrediction() {
        this.prediction.resetItem();
        const bankerData = this.derivedScoreBoardController.getPrediction(true);
        const playerData = this.derivedScoreBoardController.getPrediction(false);
        this.predictData.player = playerData;
        this.predictData.banker = bankerData;
        this.prediction.setBanker(bankerData);
        this.prediction.setPlayer(playerData);
    }

    private renderStatistic() {
        const data = this.roundHistory.reduce(
            (total, round) => {
                for (const key in total) {
                    total[key] += +round.settlementResult[key];
                }
                return total;
            },
            {
                player: 0,
                banker: 0,
                tie: 0,
                playerPair: 0,
                bankerPair: 0,
                big: 0,
                small: 0
            }
        );

        for (const childName in this.statisticChildrenName) {
            this.statistic.getChildByName(childName).getComponent(cc.Label).string = data[childName].toString();
        }
    }

    private resetStatistic() {
        for (const childName in this.statisticChildrenName) {
            this.statistic.getChildByName(childName).getComponent(cc.Label).string = "0";
        }
    }

    zoom(event: any, mode: string) {
        !this.isFirstLoad && AudioManager.getInstance().playClick();
        switch (mode) {
            case this.zoomModes.normal:
                this.node.getChildByName(this.zoomModes.normal).active = true;
                this.node.getChildByName(this.zoomModes.zoomInBigRoad).active = false;
                this.node.getChildByName(this.zoomModes.zoomInDerivedScoreboards).active = false;
                this.runActionZoom(this.node.getChildByName(this.zoomModes.normal));
                break;

            case this.zoomModes.zoomInBigRoad:
                this.node.getChildByName(this.zoomModes.normal).active = false;
                this.node.getChildByName(this.zoomModes.zoomInBigRoad).active = true;
                this.node.getChildByName(this.zoomModes.zoomInDerivedScoreboards).active = false;
                this.runActionZoom(this.node.getChildByName(this.zoomModes.zoomInBigRoad));
                break;

            case this.zoomModes.zoomInDerivedScoreboards:
                this.node.getChildByName(this.zoomModes.normal).active = false;
                this.node.getChildByName(this.zoomModes.zoomInBigRoad).active = false;
                this.node.getChildByName(this.zoomModes.zoomInDerivedScoreboards).active = true;
                this.runActionZoom(this.node.getChildByName(this.zoomModes.zoomInDerivedScoreboards));
                break;
        }
    }

    private runActionZoom(node: cc.Node) {
        node.runAction(
            cc.sequence(
                cc.callFunc(() => {
                    node.setScale(0.5);
                }),
                cc.scaleTo(0.2, 1)
            )
        );
    }
}
