const { ccclass, property } = cc._decorator;

@ccclass
export default class SevenUpDownMultiplierItem extends cc.Component {
    public multiplierValue = 0;

    onLoad() {
        this.node.getComponent(cc.Label).string = `${this.multiplierValue}x`;
    }
}
