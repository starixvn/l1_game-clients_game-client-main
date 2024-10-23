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

    renderMultiplier(multiplierValue: number, multiplierChoice: string) {
        const choice = this.listMultiplier.find((choice) => choice.node.name === multiplierChoice);
        choice.string = `${multiplierValue}x`;
    }
}
