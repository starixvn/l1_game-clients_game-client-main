import RouletteUtils from "./RouletteUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RouletteResultNumber extends cc.Component {
    @property(cc.Sprite)
    background: cc.Sprite = null;

    @property(cc.Label)
    label: cc.Label = null;

    setNumber(number: number) {
        this.label.string = number.toString();
        const color = cc.Color.BLACK;
        this.background.node.color =
            number === 0 ? color.fromHEX("#145c1c") : RouletteUtils.isRed(number) ? color.fromHEX("#b80201") : color;
        this.show();
    }

    show() {
        this.node.active = true;
    }

    hide() {
        this.node.active = false;
    }
}
