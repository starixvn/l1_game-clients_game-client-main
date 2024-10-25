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

    animRollingMultiplier() {
        const moveDownDuration = 0.25;
        const moveUpDuration = 0.35;
        const normalSpinDuration = 2 - moveUpDuration - moveDownDuration;

        const offset = 100;
        cc.tween(this.node)
            .to(moveDownDuration, { position: cc.v2(this.node.x, -300) }, { easing: "backIn" })
            .to(normalSpinDuration, { position: cc.v2(this.node.x, offset + 300) })
            .parallel(cc.tween().to(moveUpDuration, { position: cc.v2(this.node.x, offset) }, { easing: "backOut" }))
            .start();
    }
}
