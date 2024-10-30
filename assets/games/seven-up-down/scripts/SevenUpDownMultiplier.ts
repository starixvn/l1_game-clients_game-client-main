import SevenUpDownMultiplierChoice from "./SevenUpDownMultiplierChoice";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SevenUpDownMultiplier extends cc.Component {
    @property(cc.Prefab)
    pfbMultiplier: cc.Prefab = null;

    @property(cc.Node)
    listMultiplier: cc.Node[] = [];

    private multiplierAnim: SevenUpDownMultiplierChoice = null;

    onLoad() {
        this.resetMultiplier();
    }

    resetMultiplier() {
        this.listMultiplier.forEach(async (item) => {
            if (item.children.length > 0) {
                const comp = item.children[0].getComponent(SevenUpDownMultiplierChoice);
                await comp.handleSpineMultiplier("hide");
                item.destroyAllChildren();
            }
        });
    }

    renderMultiplier(multiplier: any, listMultipliers: number[]) {
        const choice = this.listMultiplier.find((choice) => choice.name === multiplier.choice);
        const multiplierNode = cc.instantiate(this.pfbMultiplier);
        this.multiplierAnim = multiplierNode.getComponent(SevenUpDownMultiplierChoice);
        this.multiplierAnim.multiplierValue = multiplier.value;
        this.multiplierAnim.listMultiplierOrgin = listMultipliers;
        choice.addChild(multiplierNode);
    }
}
