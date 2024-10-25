import SevenUpDownMultiplierItem from "./SevenUpDownMultiplierItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SevenUpDownMultiplierAnim extends cc.Component {
    @property(cc.Node)
    lblMultiplier: cc.Node = null;

    @property(cc.Prefab)
    pfbMultiplier: cc.Prefab = null;

    public listMultiplier = [2, 3, 4, 5, 6, 7, 8, 2, 3, 4, 5, 6, 7, 8, 2, 3, 4, 5, 6, 7, 8];
    public multiplierValue = 4;

    onLoad() {
        this.appendMultiplier();
        this.animRollingMultiplier();
    }

    animRollingMultiplier() {
        const moveDownDuration = 0.15;
        const moveUpDuration = 1;
        const normalSpinDuration = 3 - moveUpDuration - moveDownDuration;

        const offset = 864;
        cc.tween(this.lblMultiplier)
            .delay(0.2)
            .to(normalSpinDuration, { position: cc.v2(this.lblMultiplier.x, -offset) }, { easing: "sineOut" })
            //.to(moveUpDuration, { position: cc.v2(this.lblMultiplier.x, -offset) }, { easing: "easeOut" })
            .start();
    }

    appendMultiplier() {
        this.lblMultiplier.addChild(this.renderMultiplierValue(this.multiplierValue));
        for (let i = 0; i < this.listMultiplier.length; i++) {
            const item = this.renderMultiplierValue(this.listMultiplier[i]);
            this.lblMultiplier.addChild(item);
        }

        this.lblMultiplier.getComponent(cc.Layout).updateLayout();
    }

    renderMultiplierValue(value: number) {
        const multiplierItem = cc.instantiate(this.pfbMultiplier);
        const comp = multiplierItem.getComponent(SevenUpDownMultiplierItem);
        comp.multiplierValue = value;
        return multiplierItem;
    }
}
