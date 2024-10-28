import SlotGameBase from "../../_slotgame_base/SlotGameBase";

const { ccclass, property } = cc._decorator;

export const WayToGoalId = 49;

@ccclass
export default class WayToGoal extends SlotGameBase {
    @property({ type: cc.AudioSource, override: true, visible: false })
    musicBg: cc.AudioSource = null;
    songListConfig = {
        SC1: ["SC1/song1"]
    };

    constructor() {
        super();
        this.gameId = WayToGoalId;
    }
}
