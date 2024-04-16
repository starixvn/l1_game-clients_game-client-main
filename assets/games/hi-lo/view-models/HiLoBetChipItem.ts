const { ccclass, property } = cc._decorator;

@ccclass
export default class HiLoBetChipItem extends cc.Component {
    @property(cc.Label)
    number: cc.Label = null;

    @property(cc.Sprite)
    selectedBg: cc.Sprite = null;

    public renderBetChipItem(value: number) {
        this.number.string = value.toString();
        this.node.name = value.toString();
    }

    public setSelectedBg(isSelected: boolean) {
        this.selectedBg.node.active = isSelected;
    }
}
