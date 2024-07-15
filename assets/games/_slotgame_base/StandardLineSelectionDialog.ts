import LineSelectionDialog from "./LineSelectionDialog";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StandardLineSelectionDialog extends LineSelectionDialog {
    @property({ type: cc.Node, override: true, visible: false })
    bgActive: cc.Node[] = [];

    loadPaylineSprite(num): cc.SpriteFrame {
        return this.atlas.getSpriteFrame(`line-selection-${num}`);
    }

    update(dt: number) {
        // empty
    }
}
