import FreeSpinsPromotionHandler, { FreeSpinsPromotionEvents } from "../../../lobby/promotions/FreeSpinsPromotionHandler";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GiftCodeRedeemPopup extends cc.Component {
    @property(cc.EditBox)
    inputBox: cc.EditBox = null;

    @property(cc.Button)
    redeemButton: cc.Button = null;

    @property(cc.Button)
    pasteButton: cc.Button = null;

    @property(cc.Button)
    closeButton: cc.Button = null;

    public hintLabel: cc.Label = null;

    onEnable() {
        this.inputBox.string = "";
        this.inputBox.placeholder = "Enter or Paste Your Code";
        this.redeemButton.interactable = true;

        this.pasteButton.node.on("click", this.onPasteClicked, this);
        this.redeemButton.node.on("click", this.onRedeemClicked, this);
        this.closeButton.node.on("click", this.onCloseClicked, this);
    }

    onDisable() {
        this.pasteButton.node.off("click", this.onPasteClicked, this);
        this.redeemButton.node.off("click", this.onRedeemClicked, this);
        this.closeButton.node.off("click", this.onCloseClicked, this);
    }

    async onPasteClicked() {
        if (cc.sys.isNative) {
            const text = "ab";
            this.inputBox.string = text;
            this.hintLabel.string = "Pasted from native clipboard";
        } else {
            try {
                const text = await navigator.clipboard.readText();
                this.inputBox.string = text;
                this.hintLabel.string = "Pasted from clipboard";
            } catch (e) {
                this.hintLabel.string = "Failed to read clipboard";
                cc.warn("Clipboard read failed", e);
            }
        }
    }

    onRedeemClicked() {
        /*   const code = this.inputBox.string.trim();
        if (!code) {
            cc.log("Empty code!");
            return;
        }

        // Gửi code lên server hoặc emit event
        cc.log("Redeem gift code:", code); */
        this.onCloseClicked();
        FreeSpinsPromotionHandler.getInstance().emit(FreeSpinsPromotionEvents.OPEN_FREE_SPINS_PROMOTION);
    }

    onCloseClicked() {
        this.node.destroy();
    }
}
