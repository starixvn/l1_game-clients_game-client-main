import AudioManager from "../../../common/audio/AudioManager";
import RouletteBetItem from "./roulette-bet-item";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SingleBetItem extends RouletteBetItem {
    @property({override: true})
    isGroupBet = true;

    public onBetClick(event: cc.Event.EventTouch) {
        AudioManager.getInstance().playClick();
        // const choice = this.node.name;
        this.betCallback("0");
    }
}
