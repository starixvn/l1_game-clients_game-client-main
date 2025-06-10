import AudioManager from "../../../common/audio/AudioManager";
import { formatOdds, numberWithCommas } from "../../../common/helpers/NumberHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RouletteBetItem extends cc.Component {
    @property(cc.Label)
    ownBet: cc.Label = null;

    @property(cc.Label)
    odds: cc.Label = null;

    public betCallback = (choice: string) => {};

    private setMoneyLabel(label: cc.Label, bet: number) {
        if (label) {
            label.string = bet > 0 ? numberWithCommas(bet, 1) : "";
        }
    }

    public setOwnBet(bet: number) {
        this.setMoneyLabel(this.ownBet, bet);
    }

    public setOdd(value: string) {
        if (this.odds) {
            this.odds.string = formatOdds(value);
        }
    }

    public onBetClick(event: cc.Event.EventTouch) {
        AudioManager.getInstance().playClick();
        this.betCallback(event.target.name);
    }
}
