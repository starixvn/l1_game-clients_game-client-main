import SevenUpDownMultiplierChoice from "./SevenUpDownMultiplierChoice";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SevenUpDownMultiplier extends cc.Component {
    @property(cc.Prefab)
    pfbMultiplier: cc.Prefab = null;

    @property(cc.Node)
    listMultiplier: cc.Node[] = [];

    private multiplierAnim: SevenUpDownMultiplierChoice = null;
    multipliersConfigs = [];

    onEnable() {
        this.resetMultiplier(false);
    }

    resetMultiplier(animated: boolean) {
        this.listMultiplier.forEach((item) => {
            if (animated) {
                const comp = item.getComponent(SevenUpDownMultiplierChoice);
                comp.hideMultiplier(animated);
            }
        });
    }

    renderMultiplier(multiplier: any, animated = true) {
        if (!multiplier) {
            return;
        }
        const choice = this.listMultiplier.find((choice) => choice.name === multiplier.choice);
        this.multiplierAnim = choice.getComponent(SevenUpDownMultiplierChoice);
        this.multiplierAnim.multiplierValue = multiplier.value;
        this.multiplierAnim.listMultiplierOrgin = this.multipliersConfigs;
        choice.active = true;
        this.multiplierAnim.showMultiplier(animated);
    }
}
