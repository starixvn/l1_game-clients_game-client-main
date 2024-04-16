import ClassicSpinButton from "../../_slotgame_base/ClassicSpinButton";

const { ccclass, property } = cc._decorator;

@ccclass
export default class WayToGoalSpinButton extends ClassicSpinButton {
    @property({ visible: false, override: true })
    autoSpinCountLabel: cc.Label = null;

    onLoad() {
        this.hideAutoSpin();
    }
}
