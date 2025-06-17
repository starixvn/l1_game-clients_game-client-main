import GameUtils from "../../../common/GameUtils";
import { FreeSpinsPromotionEvents } from "../../../lobby/promotions/FreeSpinsPromotionHandler";
import { uiManager } from "../../../managers/GameUIManager";

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
    private _debounceTimer: any = null;
    private readonly _originalY = 0;
    onEnable() {
        this.inputBox.string = "";
        this.redeemButton.interactable = true;

        this.pasteButton.node.on("click", this.onPasteClicked, this);
        this.redeemButton.node.on("click", this.onRedeemClicked, this);
        this.closeButton.node.on("click", this.onCloseClicked, this);
        this.inputBox.node.on("editing-did-began", this.onEditBoxFocus, this);
        this.inputBox.node.on("editing-did-ended", this.onEditBoxBlur, this);
    }

    onDisable() {
        this.pasteButton.node.off("click", this.onPasteClicked, this);
        this.redeemButton.node.off("click", this.onRedeemClicked, this);
        this.closeButton.node.off("click", this.onCloseClicked, this);
        this.inputBox.node.off("editing-did-began", this.onEditBoxFocus, this);
        this.inputBox.node.off("editing-did-ended", this.onEditBoxBlur, this);
    }

    async onPasteClicked() {
        if (cc.sys.isNative) {
            const text = "ab";
            this.inputBox.string = text;
        } else {
            try {
                const text = await navigator.clipboard.readText();
                this.inputBox.string = text;
            } catch (e) {
                cc.warn("Clipboard read failed", e);
            }
        }
    }

    onRedeemClicked() {
        const canvas = cc.find("Canvas");
        const giftPopup = GameUtils.findNodeByNameRecursive(canvas, "GiftCodePopup");

        if (giftPopup) {
            giftPopup.destroy();
        }
        this.onCloseClicked();
        uiManager.emitter.emit(FreeSpinsPromotionEvents.OPEN_FREE_SPINS_PROMOTION);
    }

    onCloseClicked() {
        this.node.destroy();
    }

    onEditBoxFocus() {
        if (this._debounceTimer) {
            clearTimeout(this._debounceTimer);
        }
        this._debounceTimer = setTimeout(() => {
            if (cc.sys.isMobile) {
                this.node.y += 200;
            }
            window.dispatchEvent(new Event("resize"));
        }, 200);
    }

    onEditBoxBlur() {
        if (cc.sys.isMobile) {
            this.node.y = this._originalY;
        }
    }
}
