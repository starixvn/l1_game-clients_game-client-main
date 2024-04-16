import ChipView from "../../../common/bet-chips/view-models/ChipView";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FootballSlotChipView extends ChipView {
    @property(cc.Node)
    background3d: cc.Node = null;

    @property(cc.Node)
    shadow3d: cc.Node = null;

    setColor(color: cc.Color) {
        super.setColor(color);
        this.background3d.color = color;
    }

    applyForSmallChip(showValue = false) {
        super.applyForSmallChip(showValue);
        this.background3d.active = true;
        this.shadow3d.active = true;
    }
}
