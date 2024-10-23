import GameUtils from "../../../common/GameUtils";
import SevenUpDownRoundResult from "./SevenUpDownRoundResult";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SevenUpDownStatistic extends cc.Component {
    @property(cc.Prefab)
    roundResultPrefab: cc.Prefab = null;

    @property(cc.Node)
    statsScrollView: cc.Node = null;

    @property(cc.Label)
    itemPercentList: cc.Label[] = [];

    @property(cc.Node)
    roundResultContainer: cc.Node = null;

    @property
    supportChoices = "down,seven,up";

    calculateWin(roundHistory: any) {
        const originalChoices = this.supportChoices.split(",");
        const percentage = GameUtils.calculateWinPercentage(originalChoices, roundHistory);
        this.itemPercentList.forEach((item, index) => {
            item.string = percentage[index];
        });
    }

    public init(currentDataLogs: any) {
        this.updateData(currentDataLogs);
    }

    updateData(dataLogs: any) {
        this.calculateWin(dataLogs);
        this.updateRoundResult(dataLogs);
        this.roundResultContainer.getComponent(cc.Layout).updateLayout();
        this.statsScrollView.getComponent(cc.ScrollView).horizontal = this.statsScrollView.width < this.roundResultContainer.width;
        this.roundResultContainer.getComponent(cc.Widget).updateAlignment();
    }

    updateRoundResult(dataLogs: any) {
        this.roundResultContainer.destroyAllChildren();
        for (const log of dataLogs) {
            const roundResultNode = cc.instantiate(this.roundResultPrefab);
            const control = roundResultNode.getComponent(SevenUpDownRoundResult);
            control.updateLabels(log);
            this.roundResultContainer.addChild(roundResultNode);
        }
    }
}
