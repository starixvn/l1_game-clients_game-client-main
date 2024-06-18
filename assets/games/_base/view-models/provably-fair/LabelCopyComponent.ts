import GameUtils from "../../../../common/GameUtils";
import { ButtonCopy } from "./ButtonCopy";
const { ccclass, property } = cc._decorator;

@ccclass
export class LabelCopyComponent extends cc.Component {
    @property(cc.Label)
    lblText: cc.Label = null;

    @property(cc.Button)
    btnCopy: cc.Button = null;

    @property(cc.Node)
    nodeDisable: cc.Node = null;

    @property(cc.Node)
    nodeOverlayText = null;

    @property(cc.Node)
    nodeDisableCopy = null;

    private cpnCopyButton: ButtonCopy = null;

    onLoad() {
        //super.onLoad();
        this.cpnCopyButton = this.btnCopy.getComponent(ButtonCopy);
    }

    setString(value: string) {
        this.lblText.string = value;
    }

    setActive(active: boolean) {
        this.btnCopy.interactable = active;
        this.lblText.node.parent.opacity = active ? 255 : 153;

        if (this.nodeDisable) {
            this.nodeDisable.active = !active;
        }
        if (this.nodeOverlayText) {
            this.nodeOverlayText.active = active;
        }
        this.nodeDisableCopy && (this.nodeDisableCopy.active = !active);
    }

    clickCopyButton() {
        this.cpnCopyButton && (this.cpnCopyButton.isCopying = true);
        this.cpnCopyButton.onClickButton(this.lblText.string);
    }
}
