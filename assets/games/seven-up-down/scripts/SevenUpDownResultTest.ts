import SevenUpDownResult from "./SevenUpDownResult";
import { ISevenUpDownResult } from "./SevenUpDownTypes";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SevenUpDownResultTest extends cc.Component {
    @property(SevenUpDownResult)
    resultComp: SevenUpDownResult = null;
    private roundId = 0;

    increaseRound() {
        this.roundId++;
    }

    private prevResult: ISevenUpDownResult = { dice1: 1, dice2: 2 };
    private currentResult: ISevenUpDownResult = { dice1: null, dice2: null };

    private getRandomNumber(max: number) {
        return Math.floor(Math.random() * max) + 1;
    }

    setCurrentResult() {
        this.currentResult = { dice1: this.getRandomNumber(6), dice2: this.getRandomNumber(6) };
    }

    async showResult() {
        this.increaseRound();
        this.setCurrentResult();
        this.resultComp.showResultAnim(this.prevResult, this.currentResult, this.roundId);
        this.prevResult = this.currentResult;
    }
}
