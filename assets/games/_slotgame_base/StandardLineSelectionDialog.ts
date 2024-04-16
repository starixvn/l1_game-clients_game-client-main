import LineItem from "./LineItem";
import LineSelectionDialog from "./LineSelectionDialog";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StandardLineSelectionDialog extends LineSelectionDialog {
    @property({ type: cc.Node, override: true, visible: false })
    bgActive: cc.Node[] = [];

    loadPaylineSprite(num): cc.SpriteFrame {
        return this.atlas.getSpriteFrame(`line-selection-${num}`);
    }

    setPaylineIconColor(item: LineItem) {
        item.setPayLineIconColor(cc.Color.WHITE, cc.Color.WHITE.fromHEX("#535050"));
    }
}
