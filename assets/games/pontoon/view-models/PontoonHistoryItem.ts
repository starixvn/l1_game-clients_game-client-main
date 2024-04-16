import GameUtils from "../../../common/GameUtils";
import BlackJackHistoryItem from "../../blackjack/view-models/BlackJackHistoryItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PontoonHistoryItem extends BlackJackHistoryItem {
    convertResult(resultLabel: cc.Label, result: number, array: any, isSplit: boolean) {
        if (result > 21) {
            resultLabel.string = GameUtils.getText(`ui.bust`);
        } else if (result === 21 && array.length === 2) {
            resultLabel.string = GameUtils.getText(`pontoon.pontoon`);
        } else if (result <= 21 && array.length === 5) {
            resultLabel.string = GameUtils.getText(`pontoon.five_card`);
        } else {
            resultLabel.string = result.toString();
        }
    }
}
