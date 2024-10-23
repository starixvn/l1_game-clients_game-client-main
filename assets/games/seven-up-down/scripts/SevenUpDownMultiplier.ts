const { ccclass, property } = cc._decorator;

@ccclass
export default class SevenUpDownMultiplier extends cc.Component {
    @property(cc.Label)
    listMultiplier: cc.Label[] = [];

    onLoad() {
        this.resetMultiplier();
    }

    resetMultiplier() {
        this.listMultiplier.forEach((item) => {
            item.string = "";
        });
    }

    renderMultiplier(multiplier: any) {
        const choice = this.listMultiplier.find((choice) => choice.node.name === multiplier.choice);
        choice.string = `${multiplier.value}x`;
    }
}
