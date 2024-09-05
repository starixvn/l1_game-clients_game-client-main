const { ccclass, property } = cc._decorator;

@ccclass
export default class ColorToggle extends cc.Component {
    @property(cc.Color)
    checkColor: cc.Color = cc.Color.WHITE;

    @property(cc.Color)
    uncheckColor: cc.Color = cc.Color.WHITE;

    @property(cc.Toggle)
    toggle: cc.Toggle = null;

    private initialized = false;

    onEnable() {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        this.toggle.node.on("toggle", this.updateCheckColor, this);
    }

    onDestroy() {
        this.toggle.node.off("toggle", this.updateCheckColor, this);
    }

    updateCheckColor() {
        this.node.color = this.toggle.isChecked ? this.checkColor : this.uncheckColor;
    }
}
