import { Socket } from "socket.io-client";
import GameUtils from "../../../common/GameUtils";
import { FreeSpinsPromotionEvents } from "../../../lobby/promotions/FreeSpinsPromotionHandler";
import { uiManager } from "../../../managers/GameUIManager";
import CommonDialog from "../../../common/_base/view-models/CommonDialog";

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
    private gameName: string;
    protected socket: Socket;

    init(socket: Socket, gameName: string) {
        this.socket = socket;
        this.gameName = gameName;
        console.log("socket", this.socket, this.gameName);
        if (this.socket) {
            this.socket.on(this.gameName, this.receivedData.bind(this));
        }
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

    receivedData(data: any) {
        console.log("receivedData", data);
        if (!this.isAlive() || !data.giftCode) {
            return;
        }
        this.redeemButton.interactable = true;

        if (data.errorCode) {
            const key = this.mapErrorCodeToMessageKey(data.errorCode);
            this.showErrorMessage(key);
            return;
        }

        if (data.isGiftCode) {
            this.destroySelf();
            uiManager.emitter.emit(FreeSpinsPromotionEvents.OPEN_FREE_SPINS_PROMOTION);
        } else {
            this.showErrorMessage("Giftcode không hợp lệ hoặc đã được sử dụng.");
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
        this.socket?.off(this.gameName, this.receivedData.bind(this));
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

    showErrorMessage(message: string) {
        if (this.errorLabel) {
            const msg = GameUtils.getText(message);
            this.errorLabel.string = msg;
            this.errorLabel.node.active = true;
        }
    }

    onRedeemClicked() {
        this.destroySelf();
        uiManager.emitter.emit(FreeSpinsPromotionEvents.OPEN_REDEEM_TRANSITION_EFFECT);
    }

    onRedeemClicked2() {
        if (!this.redeemButton.interactable) {
            return;
        }
        const giftCode = this.inputBox.string.trim().toUpperCase();

        if (!giftCode) {
            this.showErrorMessage("Vui lòng nhập giftcode.");
            return;
        }

        this.redeemButton.interactable = false;
        this.errorLabel.node.active = false;

        this.socket?.connected && this.socket.emit("verifyGiftCode", { giftCode });
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
        const canvas = cc.find("Canvas");
        const giftPopup = GameUtils.findNodeByNameRecursive(canvas, "GiftCodePopup");
        giftPopup?.destroy();
        this.onCloseClicked();
    }

    private mapErrorCodeToMessageKey(errorCode: number): string {
        switch (errorCode) {
            case 1001:
                return "giftcode.error.empty";
            case 1002:
                return "giftcode.error.invalid";
            case 1003:
                return "giftcode.error.system";
            case 1004:
                return "giftcode.error.too_many_attempts";
            default:
                return "giftcode.error.unknown";
        }
    }
}
