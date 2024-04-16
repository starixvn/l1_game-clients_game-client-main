import CommonDialog from "../../../common/_base/view-models/CommonDialog";
import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import { FruitSlotRoundHistory } from "../event-models/FruitSlotRoundHistory";
import FruitSlotMiniRoundHistoryItem from "./FruitSlotMiniRoundHistoryItem";

const { ccclass, property } = cc._decorator;

export enum CardVerificationState {
    blankNew = 0,
    serialChange,
    privateChange
}
@ccclass
export default class FruitSlotStatistic extends cc.Component {
    @property(cc.Node)
    symbolPercent: cc.Node = null;

    @property(cc.Label)
    bigPercent: cc.Label = null;

    @property(cc.Label)
    smallPercent: cc.Label = null;

    @property(cc.Node)
    history: cc.Node = null;

    @property(cc.Prefab)
    miniRoundHistoryItem: cc.Prefab = null;

    @property(CommonDialog)
    commonDialog: CommonDialog = null;

    private readonly maxItems = 100;
    private readonly maxCol = 20;
    private isRenderNext = false;
    private rounds: FruitSlotRoundHistory[] = [];
    private readonly items: cc.Node[] = [];
    private readonly symbolsKey = {
        bar: "bar",
        tripleSeven: "tripleSeven",
        star: "star",
        bell: "bell",
        watermelon: "watermelon",
        orange: "orange",
        lemon: "lemon",
        cherry: "cherry"
    };
    private readonly relatedSymbol = {
        bar: ["bar", "bar50", "bar25"],
        tripleSeven: ["tripleSeven", "tripleSeven3"],
        star: ["star", "star3"],
        bell: ["bell", "bell3"],
        watermelon: ["watermelon", "watermelon3"],
        orange: ["orange", "orange3"],
        lemon: ["lemon", "lemon3"],
        cherry: ["cherry", "cherry3"]
    };

    onLoad() {
        this.commonDialog.addOnDidHide(() => {
            this.node.active = false;
        });
    }

    render(roundsHistory: FruitSlotRoundHistory[]) {
        this.rounds = [...roundsHistory];
        while (this.rounds.length < this.maxItems) {
            this.rounds.unshift(null);
        }
        this.calculatePercent();
        this.setDataHistory(false);
    }

    addItem(round: FruitSlotRoundHistory) {
        if (this.isRenderNext) {
            this.isRenderNext = false;
        }
        const index = this.rounds.findIndex((r) => r !== null);
        if (index === 0) {
            this.rounds.unshift(round);
            this.rounds.length > this.maxItems && this.rounds.pop();
        } else {
            const i = index === -1 ? this.maxItems - 1 : index - 1;
            this.rounds[i] = round;
        }
        this.calculatePercent();
        this.setDataHistory(false);
    }

    addNextItemHistory() {
        if (this.isRenderNext) {
            return;
        }
        this.rounds[0] && this.rounds.unshift(null);
        while (this.rounds.length > this.maxItems) {
            this.rounds.pop();
        }
        this.setDataHistory(true);
        this.isRenderNext = true;
    }

    initMiniRoundHistory() {
        for (let i = 0; i < this.maxItems; i++) {
            const item = cc.instantiate(this.miniRoundHistoryItem);
            item.getComponent(FruitSlotMiniRoundHistoryItem).setData(null);
            this.history.children[Math.floor(i / this.maxCol)].addChild(item);
            this.items.push(item);
        }
    }

    private calculatePercent() {
        const bigSmallStatistic = { big: 0, small: 0 };
        let total = 0;
        this.rounds.forEach((round) => {
            if (round) {
                total += 1;
                if (round.settlementResult.big) {
                    bigSmallStatistic.big += 1;
                } else {
                    bigSmallStatistic.small += 1;
                }
            }
        });
        const bigPercentage = +numberWithCommas((bigSmallStatistic.big * 100) / total, 2);
        this.bigPercent.string = `${bigPercentage}% `;
        this.smallPercent.string = ` ${
            bigPercentage === 0 && bigSmallStatistic.small === 0 ? 0 : +numberWithCommas(100 - bigPercentage, 2)
        }%`;
        this.renderSymbolStatistic();
    }

    private renderSymbolStatistic() {
        const statistic = {};
        const detail = {};
        let total = 0;
        let percentTotal = 0;
        this.rounds.forEach((round) => {
            if (round) {
                total += round.result.symbols.length;
                for (const key in round.settlementResult) {
                    round.settlementResult[key] && (detail[key] = (detail[key] ?? 0) + 1);
                }
            }
        });

        for (const key in this.symbolsKey) {
            statistic[key] = 0;
            for (const symbol in this.relatedSymbol[key]) {
                statistic[key] += detail[this.relatedSymbol[key][symbol]] ?? 0;
            }
            const percent = +numberWithCommas((statistic[key] * 100) / total, 2);
            key !== this.symbolsKey.cherry && (percentTotal += percent);
            this.symbolPercent.getChildByName(key).getComponent(cc.Label).string = `${percent}%`;
        }
        this.symbolPercent.getChildByName(this.symbolsKey.cherry).getComponent(cc.Label).string = `${
            (percentTotal === 0 && total === 0) || statistic["cherry"] === 0 ? 0 : numberWithCommas(100 - percentTotal, 2)
        }%`;
    }

    private setDataHistory(isNextItem: boolean) {
        this.rounds.forEach((round, index) => {
            let isBlink = index < this.maxItems - 1 && this.rounds[index + 1] && this.rounds[index] === null ? isNextItem : false;
            index === this.maxItems - 1 && this.rounds[index] === null && (isBlink = isNextItem);
            this.items[index].getComponent(FruitSlotMiniRoundHistoryItem).setData(round, isBlink);
        });
    }
}
