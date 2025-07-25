import GameUtils from "../../common/GameUtils";
import { FreeSpinsPromotionEvents, freeSpinsPromotionHandler } from "../../lobby/free-spin-bonus-promotion/FreeSpinsPromotionHandler";
import { uiManager } from "../../managers/GameUIManager";
import CommonDialog from "../../common/_base/view-models/CommonDialog";

const { ccclass, property } = cc._decorator;
@ccclass
export default class GiftCodeRedeemPopup extends CommonDialog {
    @property(cc.EditBox)
    inputBox: cc.EditBox = null;

    @property(cc.Button)
    redeemButton: cc.Button = null;

    @property(cc.Button)
    closeButton: cc.Button = null;

    @property(cc.Label)
    errorLabel: cc.Label = null;

    @property(cc.Node)
    giftCodeNode: cc.Node = null;

    private _debounceTimer: any = null;
    private readonly _originalY = 0;

    onLoad() {
        uiManager.emitterListener(
            FreeSpinsPromotionEvents.REDEEM_GIFT_CODE_ERROR,
            (redemptionNotice) => this.onRedeemError(redemptionNotice),
            this
        );
        uiManager.emitterListener(
            FreeSpinsPromotionEvents.OPEN_REDEEM_TRANSITION_EFFECT,
            () => this.destroySelf(),
            this
        );
    }

    showDialog() {
        this.node.active = true;
        this.giftCodeNode.scale = 0.3;
        this.giftCodeNode.opacity = 0;

        cc.tween(this.giftCodeNode)
            .delay(0.2)
            .to(this.time, { scale: 1.1, opacity: 255 }, { easing: "cubicOut" })
            .to(this.time * 0.3, { scale: 1.0 }, { easing: "cubicInOut" })
            .start();
    }

    onEnable() {
        this.showDialog();
        this.inputBox.string = "";
        this.redeemButton.interactable = true;
        this.redeemButton.node.on("click", this.onRedeemClicked, this);
        this.closeButton.node.on("click", this.onCloseClicked, this);
        this.inputBox.node.on("editing-did-began", this.onEditBoxFocus, this);
        this.inputBox.node.on("editing-did-ended", this.onInputFinalized, this);
        this.startRedeemButtonPulse();
    }
    public isAlive(): boolean {
        return this.node && this.node.isValid;
    }

    onRedeemError(redemptionNotice: { errorCode: string }) {
        console.log("onRedeemError", redemptionNotice);
        this.redeemButton.interactable = true;
        this.startRedeemButtonPulse();
        if (redemptionNotice?.errorCode) {
            const fallback = this.mapErrorCodeToMessageKey(redemptionNotice.errorCode);
            this.showErrorMessage(fallback);
        }
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
            this.inputBox.string = text.trim().toUpperCase();
        } catch (e) {
            cc.warn("Clipboard read failed", e);
        }
    }

    showErrorMessage(key: string) {
        if (this.errorLabel) {
            const msg = GameUtils.getText(key);
            this.errorLabel.string = msg;
            this.errorLabel.node.active = true;
        }
    }

    onRedeemClicked() {
        if (!this.redeemButton.interactable) {
            return;
        }
        const giftCode = this.inputBox.string.trim().toUpperCase();

        this.redeemButton.interactable = false;
        this.errorLabel.node.active = false;
        cc.Tween.stopAllByTarget(this.redeemButton.node);
        this.redeemButton.node.scale = 1.2;
        freeSpinsPromotionHandler.redeemGiftCode(giftCode);
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

    private destroySelf() {
        uiManager.emitter.emit(FreeSpinsPromotionEvents.DESTROY_GIFT_CODE_NODE);
        this.onCloseClicked();
    }

    onDestroy() {
        uiManager.removeListenersWithTarget(this);
    }

    private mapErrorCodeToMessageKey(errorCode: string): string {
        switch (errorCode) {
            case "SB3019":
                return "FreeSpinBonus.gift_code_error_message";
            case "SB3020":
                return "FreeSpinBonus.Invalide_gift_code_error_message";
            case "SB3021":
                return "FreeSpinBonus.Unexpected_gift_code_error_message";
            default:
                return "FreeSpinBonus.Invalide_gift_code_error_message";
        }
    }
}
