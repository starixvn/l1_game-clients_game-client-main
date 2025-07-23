import AnalyticsManager, { TrackingAction, TrackingEvent } from "../../analytics/AnalyticsManager";
import CommonDialog from "../../common/_base/view-models/CommonDialog";
import * as sessionManager from "../../common/auth/SessionManager";
import GameUtils from "../../common/GameUtils";
import { FreeSpinsPromotionEvents, freeSpinsPromotionHandler } from "../../lobby/free-spin-bonus-promotion/FreeSpinsPromotionHandler";
import { uiManager } from "../../managers/GameUIManager";
import { InternalEvents } from "../../managers/InternalEvents";
import LobbyDialogManager from "../../managers/LobbyDialogManager";
import { StorageManager } from "../../managers/StorageManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FreeSpinsPromotionDialog extends CommonDialog {
    @property(cc.Toggle)
    dontShowAgainToggle: cc.Toggle = null;
    @property(cc.Label)
    gameNameLabel: cc.Label = null;

    @property(cc.Node)
    playNowInGame: cc.Node = null;
    @property(cc.Node)
    playNowInLobby: cc.Node = null;

    @property(cc.Node)
    playLater: cc.Node = null;

    @property(cc.Node)
    closeButton: cc.Node = null;

    @property(cc.Node)
    background: cc.Node = null;

    private readonly TRACKING_OBJECT_NAME = "Free spins promotion";
    private _bgTween: cc.Tween<cc.Node> = null;

    onChangeToggleDontShowAgain(toggle: cc.Toggle) {
        const isChecked = toggle.isChecked;
        StorageManager.set(freeSpinsPromotionHandler.getStorageKey(), { dontShowAgain: isChecked });
    }
    async start() {
        const isDirect = freeSpinsPromotionHandler.isDirectlyOpen;
        const isAnnouncementDetailsActive = freeSpinsPromotionHandler.activeDetailPromo;

        this.updateUIVisibility(isDirect, isAnnouncementDetailsActive);

        const shouldRestoreToggle = !isDirect && !isAnnouncementDetailsActive;
        if (shouldRestoreToggle) {
            this.restoreDontShowToggle();
            await this.setGameName();
        }
    }

    private updateUIVisibility(isDirect: boolean, isAnnouncementDetailsActive: boolean) {
        const showStandardUI = !isAnnouncementDetailsActive;

        this.dontShowAgainToggle.node.active = showStandardUI && !isDirect;
        this.playNowInGame.active = showStandardUI && isDirect;
        this.playNowInLobby.active = showStandardUI && !isDirect;
        this.closeButton.active = isAnnouncementDetailsActive || (!isDirect && showStandardUI);
        this.playLater.active = showStandardUI;
    }

    onEnable(): void {
        super.onEnable();
        if (this.background) {
            this.background.active = true;
            this.background.opacity = 0;

            this._bgTween = cc.tween(this.background).to(1, { opacity: 150 }, { easing: "sineOut" }).start();
        }
        if (!freeSpinsPromotionHandler.isDirectlyOpen) {
            this.time = 0.4;
        }
    }

    onDisable(): void {
        super.onDisable();
        if (this._bgTween) {
            this._bgTween.stop();
            this._bgTween = null;
        }
    }

    private restoreDontShowToggle() {
        const storage = StorageManager.get(freeSpinsPromotionHandler.getStorageKey());
        if (storage && typeof storage.dontShowAgain === "boolean") {
            this.dontShowAgainToggle.isChecked = storage.dontShowAgain;
        }
    }

    async setGameName() {
        const gameId = freeSpinsPromotionHandler.getGameId();
        if (gameId) {
            this.gameNameLabel.string = (await GameUtils?.getDisplayGameName(gameId)) ?? "";
        }
    }

    protected onDestroy(): void {
        LobbyDialogManager.getInstance().onCloseDialog();
    }

    closeDialog(enableSound = true) {
        const isChecked = this.dontShowAgainToggle?.isChecked;
        if (isChecked) {
            StorageManager.set(freeSpinsPromotionHandler.getStorageKey(), { dontShowAgain: true });
        }
        super.closeDialog(enableSound);
        LobbyDialogManager.getInstance().onCloseDialog();
        freeSpinsPromotionHandler.closePromoPopup();
    }

    playGameNow() {
        LobbyDialogManager.getInstance().clearQueue();
        this.closeDialog();
        if (freeSpinsPromotionHandler.isDirectlyOpen) {
            if (freeSpinsPromotionHandler.giftCodeNode?.isValid) {
                freeSpinsPromotionHandler.giftCodeNode.destroy();
                freeSpinsPromotionHandler.giftCodeNode = null;
            }
        } else {
            freeSpinsPromotionHandler.skipGiftCode = true;
        }
        uiManager.emitter.emit(FreeSpinsPromotionEvents.OPEN_PROMOTION_DETAILS_PANEL, true);
        const gameId = freeSpinsPromotionHandler.getGameId();
        sessionManager.setCheckedTournamentPromotionFirstSso(true);
        if (!gameId) {
            return;
        }
        uiManager.emitter.emit(InternalEvents.OPEN_GAME, gameId);

        AnalyticsManager.Instance.trackEvent(TrackingEvent.Button, {
            location: cc.director.getScene().name,
            action: TrackingAction.Click,
            object_name: this.TRACKING_OBJECT_NAME
        });
    }
}
