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
    closeButton: cc.Button = null;
    private _debounceTimer: any = null;
    private readonly _originalY = 0;
    onEnable() {
        this.inputBox.string = "";
        this.redeemButton.interactable = true;
        this.redeemButton.node.on("click", this.onRedeemClicked, this);
        this.closeButton.node.on("click", this.onCloseClicked, this);
        this.inputBox.node.on("editing-did-began", this.onEditBoxFocus, this);
        this.inputBox.node.on("editing-did-ended", this.onInputFinalized, this);
        this.startRedeemButtonPulse();
    }
    startRedeemButtonPulse() {
        const node = this.redeemButton.node;
        node.scale = 1.0;

        cc.tween(node)
            .repeatForever(
                cc
                    .tween()
                    .to(0.2, { scale: 0.93 }, { easing: "sineIn" })
                    .to(0.4, { scale: 1.05 }, { easing: "sineOut" })
                    .to(0.3, { scale: 1.0 }, { easing: "sineInOut" })
            )
            .start();
    }

    onDisable() {
        this.redeemButton.node.off("click", this.onRedeemClicked, this);
        this.closeButton.node.off("click", this.onCloseClicked, this);
        this.inputBox.node.off("editing-did-began", this.onEditBoxFocus, this);
        this.inputBox.node.off("editing-did-ended", this.onInputFinalized, this);
        cc.Tween.stopAllByTarget(this.redeemButton.node);
    }

    onInputFinalized(editBox: cc.EditBox) {
        const upper = editBox.string.toUpperCase();
        if (editBox.string !== upper) {
            editBox.string = upper;
        }

        this.onEditBoxBlur();
    }

    async onPasteClicked() {
        this.inputBox.blur();
        let text = "";

        try {
            text = await navigator.clipboard.readText();
            this.inputBox.string = text.toUpperCase();
        } catch (e) {
            cc.warn("Clipboard read failed", e);
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
        cc.tween(this.node)
            .to(0.3, { scale: 0, opacity: 0 }, { easing: "backIn" })
            .call(() => {
                this.node.destroy();
            })
            .start();
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
