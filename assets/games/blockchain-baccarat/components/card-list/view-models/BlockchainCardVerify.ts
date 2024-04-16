import { i18n } from "../../../../../ClientModules";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BlockchainCardVerify extends cc.Component {
    @property(cc.Button)
    btnVerify: cc.Button = null;

    @property(cc.Node)
    success: cc.Node = null;

    @property(cc.Node)
    failed: cc.Node = null;

    @property(cc.Label)
    text: cc.Label = null;

    btnActive: cc.Node;
    btnDisable: cc.Node;

    setText(text: string) {
        this.text.string = text;
    }

    setStatusVerify(enabled: boolean) {
        this.setText(i18n.t("blockchainBaccarat.verify"));
        this.btnActive = this.btnVerify.node.getChildByName("btn-active");
        this.btnDisable = this.btnVerify.node.getChildByName("btn-disable");
        this.success.active = this.failed.active = false;
        this.btnActive.active = enabled;
        this.btnDisable.active = !enabled;
        this.setInteractable(enabled);
    }

    setInteractable(enabled) {
        this.btnVerify.interactable = enabled;
    }

    setVerifySuccess(highlight: boolean) {
        this.setText("");
        this.setInteractable(false);
        this.btnActive.active = this.btnDisable.active = false;
        if (highlight) {
            this.success.active = true;
        } else {
            this.failed.active = true;
        }
    }
}
