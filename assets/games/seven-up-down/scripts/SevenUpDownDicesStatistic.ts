import GameUtils from "../../../common/GameUtils";
import GameBase from "../../_base/GameBase";
import GameBaseFinishHandler from "../../_base/handlers/GameBaseFinishHandler";
import GameLogControlBase from "../../_base/view-models/GameLogControlBase";
import { findWinningChoice } from "./SevenUpDownHelper";
import SevenUpDownRoundResult from "./SevenUpDownRoundResult";

const { ccclass, property } = cc._decorator;

export enum IconButtonChart {
    chartDice,
    chartDot
}

@ccclass
export default class SevenUpDownDicesStatistic extends cc.Component {
    @property(cc.Label)
    itemPercentList: cc.Label[] = [];

    @property(cc.Prefab)
    roundResultPrefab: cc.Prefab = null;

    @property(cc.Node)
    statsScrollView: cc.Node = null;

    @property(GameLogControlBase)
    logView: GameLogControlBase = null;

    @property(cc.Node)
    roundResultContainer: cc.Node = null;

    @property(cc.SpriteFrame)
    diceSpriteFrames: cc.SpriteFrame[] = [];

    @property(cc.SpriteFrame)
    iconSpriteFrames: cc.SpriteFrame[] = [];

    @property(cc.Sprite)
    buttonSprite: cc.Sprite = null;

    protected isShowDiceView = true;

    public setData(dataLogs: any[]) {
        this.updateData(dataLogs);
    }

    init(main: GameBase) {
        const condition = () => {
            const finishHandler = main.finishHandler as GameBaseFinishHandler;
            return (
                main.currentTimeRemaining < main.config.stopBetTime ||
                main.currentTimeRemaining > main.config.fullTime - finishHandler.getResultAnimationTime()
            );
        };
        this.logView.init(condition);
    }

    get getChoices(): string[] {
        return ["up", "seven", "down"];
    }

    updatePercentages(dataLogs: any[]) {
        const percentage = GameUtils.calculateWinPercentage(this.getChoices, dataLogs);
        this.itemPercentList.forEach((item, index) => {
            item.string = `${Object.values(percentage)[index]}%`;
        });
    }

    updateData(dataLogs: any[]) {
        this.updatePercentages(dataLogs);
        this.updateRoundResult(dataLogs);
        this.renderLogView(dataLogs);

        this.roundResultContainer.getComponent(cc.Layout).updateLayout();
        this.statsScrollView.getComponent(cc.ScrollView).horizontal = this.statsScrollView.width < this.roundResultContainer.width;
        this.roundResultContainer.getComponent(cc.Widget).updateAlignment();
    }

    updateRoundResult(dataLogs: any[]) {
        this.roundResultContainer.destroyAllChildren();

        for (let i = 0; i < dataLogs.length; i++) {
            const dataLog = dataLogs[i];
            const { result } = dataLog;
            const roundResultNode = cc.instantiate(this.roundResultPrefab);
            const roundResultComponent = roundResultNode.getComponent(SevenUpDownRoundResult);
            roundResultComponent.updateLabels(dataLog);
            roundResultComponent.dice1.spriteFrame = this.diceSpriteFrames[result.dice1 - 1];
            roundResultComponent.dice2.spriteFrame = this.diceSpriteFrames[result.dice2 - 1];
            roundResultComponent.highlight.node.active = i === 0;
            this.roundResultContainer.addChild(roundResultNode);
        }
    }

    renderLogView(dataLogs: any[]) {
        const statsData = [];
        if (dataLogs.length > 0) {
            dataLogs.forEach((log) => {
                const { settlementResult } = log;
                const indexWin = this.getChoices.indexOf(findWinningChoice(settlementResult));
                statsData.unshift(indexWin);
            });
            this.logView.setData(statsData);
        }
    }

    changeDisplayMode() {
        this.isShowDiceView = !this.isShowDiceView;
        this.buttonSprite.spriteFrame = this.isShowDiceView
            ? this.iconSpriteFrames[IconButtonChart.chartDice]
            : this.iconSpriteFrames[IconButtonChart.chartDot];
        this.statsScrollView.active = this.isShowDiceView;
        this.logView.node.active = !this.isShowDiceView;
    }
}
