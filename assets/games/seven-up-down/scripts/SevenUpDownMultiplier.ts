import SevenUpDownMultiplierAnim from "./SevenUpDownMultiplierAnim";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SevenUpDownMultiplier extends cc.Component {
    @property(cc.Prefab)
    pfbMultiplier: cc.Prefab = null;

    @property(cc.Node)
    listMultiplier: cc.Node[] = [];

    onLoad() {
        this.resetMultiplier();
    }

    resetMultiplier() {
        this.listMultiplier.forEach((item) => {
            item.destroyAllChildren();
        });
    }

    renderMultiplier(multiplier: any) {
        const choice = this.listMultiplier.find((choice) => choice.name === multiplier.choice);
        const multiplierNode = cc.instantiate(this.pfbMultiplier);
        const comp = multiplierNode.getComponent(SevenUpDownMultiplierAnim);
        comp.multiplierValue = multiplier.value;
        choice.addChild(multiplierNode);
    }
}
