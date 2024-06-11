import GameBase from "../../../games/_base/GameBase";
import GameBaseFinishHandler from "../../../games/_base/handlers/GameBaseFinishHandler";
import GameLogControlBase from "../../../games/_base/view-models/GameLogControlBase";
import MiniCoinTossRoundHistoryItem from "./MiniCoinTossRoundHistoryItem";

const { ccclass, property } = cc._decorator;

type result = { head: boolean }[];
@ccclass
export default class MiniCoinTossRoundHistory extends cc.Component {
    @property(GameLogControlBase)
    logControl: GameLogControlBase = null;

    @property(cc.Label)
    tail: cc.Label = null;

    @property(cc.Label)
    head: cc.Label = null;

    protected suffix = "%";

    public setData(redData: result) {
        this.updateHistory(redData);
    }

    public init(main: GameBase) {
        const condition = () => {
            const finishHandler = main.finishHandler as GameBaseFinishHandler;
            return (
                main.currentTimeRemaining < main.config.stopBetTime ||
                main.currentTimeRemaining > main.config.fullTime - finishHandler.getResultAnimationTime()
            );
        };
        this.logControl.init(condition);
    }

    private updateHistory(data: result) {
        this.updateStatistic(data);
        if (this.logControl) {
            this.setRoundHistoryItemData(data);
        }
    }

    private setRoundHistoryItemData(data: result) {
        data.reverse();
        const logData = data.map((d) => (d.head ? 1 : 0));
        this.logControl.setData(logData);
        const items = this.logControl.content.getComponentsInChildren(MiniCoinTossRoundHistoryItem);
        items.forEach((item, i) => item.setValue(data[i].head));
    }

    private updateStatistic(redData: result) {
        const total = redData.length;

        if (total === 0) {
            this.updateStatisticLabels({
                tailValue: 0,
                headValue: 0
            });
            return;
        }

        let head = 0;
        redData.forEach((i) => {
            if (i.head) {
                head++;
            }
        });

        const headValue = Math.round((head * 100) / total);
        const tailValue = 100 - headValue;
        this.updateStatisticLabels({ headValue, tailValue });
    }

    protected updateStatisticLabels({ headValue, tailValue }) {
        this.head.string = `${headValue}${this.suffix}`;
        this.tail.string = `${tailValue}${this.suffix}`;
    }
}
