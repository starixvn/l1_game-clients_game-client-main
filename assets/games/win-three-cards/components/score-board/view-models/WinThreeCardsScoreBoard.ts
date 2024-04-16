import { WinThreeCardsRoundHistory } from "../../../view-models/WinThreeCardsModel";
import WinThreeCardsBigRoad from "./WinThreeCardsBigRoad";
import WinThreeCardsRoundResult from "./WinThreeCardsRoundResult";

const { ccclass, property } = cc._decorator;

enum StatisticChildrenName {
    dragon = 0,
    phoenix,
    pair8Plus
}
@ccclass
export default class WinThreeCardsScoreBoard extends cc.Component {
    @property(WinThreeCardsBigRoad)
    bigRoads: WinThreeCardsBigRoad = null;

    @property(cc.Label)
    statistic: cc.Label[] = [];

    @property(cc.Node)
    roundResultContainer: cc.Node = null;

    @property(cc.Node)
    containerStatic: cc.Node = null;

    @property(cc.Prefab)
    roundResultPrefab: cc.Prefab = null;

    public renderScoreBoardInGame(roundHistory: WinThreeCardsRoundHistory[]) {
        this.bigRoads.renderScoreBoardInGame(roundHistory);
        this.renderStatistic(roundHistory);
        this.updateRoundResult(roundHistory);
    }

    public renderNextNode() {
        this.bigRoads.renderNextNode();
    }

    private renderStatistic(roundHistory: WinThreeCardsRoundHistory[]) {
        const data = roundHistory.reduce(
            (total, round) => {
                for (const key in total) {
                    total[key] += +round.settlementResult[key];
                }
                return total;
            },
            {
                dragon: 0,
                phoenix: 0,
                pair8Plus: 0
            }
        );

        Object.values(StatisticChildrenName)
            .filter((value) => typeof value !== "number")
            .forEach((name: string, index: number) => {
                this.statistic[index].string = data[name].toString();
            });
    }

    private updateRoundResult(dataLogs: WinThreeCardsRoundHistory[]) {
        this.roundResultContainer.destroyAllChildren();
        this.containerStatic.destroyAllChildren();
        let totalWidthChild = 0;
        for (const dataLog of dataLogs) {
            const { result, settlementResult } = dataLog;
            const roundResultNode = cc.instantiate(this.roundResultPrefab);
            const roundResultComponent = roundResultNode.getComponent(WinThreeCardsRoundResult);
            roundResultComponent.changeColorText(settlementResult);
            roundResultComponent.changeBackgroundColor(settlementResult);
            roundResultComponent.changeValueText(result);
            this.roundResultContainer.addChild(roundResultNode);

            totalWidthChild += roundResultNode.width;
        }

        this.roundResultContainer.getComponent(cc.Layout).updateLayout();
        const parentNode = this.roundResultContainer.parent;
        const maskWidth = parentNode.parent.width;
        parentNode.width = totalWidthChild;
        parentNode.getComponent(cc.Layout).updateLayout();
        if (maskWidth > totalWidthChild) {
            const widget = parentNode.getComponent(cc.Widget);
            widget.right = 0;
            widget.updateAlignment();
        }
    }
}
