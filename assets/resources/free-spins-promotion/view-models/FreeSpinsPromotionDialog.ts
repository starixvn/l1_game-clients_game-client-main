import CommonDialog from "../../../common/_base/view-models/CommonDialog";
import { StorageManager } from "../../../managers/StorageManager";
import FreeSpinsPromotionHandler, {
    FreeSpinsPromotionEvents,
    freeSpinsPromotionHandler
} from "../../../lobby/promotions/FreeSpinsPromotionHandler";
import AnalyticsManager, { TrackingEvent, TrackingAction } from "../../../analytics/AnalyticsManager";
import { uiManager } from "../../../managers/GameUIManager";
import { InternalEvents } from "../../../managers/InternalEvents";
import LobbyDialogManager from "../../../managers/LobbyDialogManager";
import * as sessionManager from "../../../common/auth/SessionManager";
import { appManager } from "../../../managers/AppManager";
import GameUtils from "../../../common/GameUtils";

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
    closeButton: cc.Node = null;

    @property(cc.Node)
    background: cc.Node = null;

    private readonly TRACKING_OBJECT_NAME = "Free spins promotion";
    private _bgTween: cc.Tween<cc.Node> = null;
    private _skippedGiftCodeManually = false;

    onChangeToggleDontShowAgain(toggle: cc.Toggle) {
        const isChecked = toggle.isChecked;
        StorageManager.set(freeSpinsPromotionHandler.getStorageKey(), { dontShowAgain: isChecked });
    }
    async start() {
        const isDirect = freeSpinsPromotionHandler.isDirectlyOpen;

        this.dontShowAgainToggle.node.active = !isDirect;
        this.playNowInGame.active = isDirect;
        this.playNowInLobby.active = !isDirect;
        this.closeButton.active = !isDirect;

        if (!isDirect) {
            this.restoreDontShowToggle();
            await this.setGameName();
        }
    }

    onEnable(): void {
        super.onEnable();
        if (this.background) {
            this.background.active = true;
            this.background.opacity = 0;

            this._bgTween = cc.tween(this.background).to(1, { opacity: 150 }, { easing: "sineOut" }).start();
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
        FreeSpinsPromotionHandler.getInstance().onCloseFreeSpinsPromotionPopup();
    }

    playGameNow() {
        this._skippedGiftCodeManually = true;
        LobbyDialogManager.getInstance().clearQueue();
        this.closeDialog();
        if (freeSpinsPromotionHandler.isDirectlyOpen) {
            const canvas = cc.find("Canvas");
            const giftPopup = GameUtils.findNodeByNameRecursive(canvas, "GiftCodePopup");

            if (giftPopup) {
                giftPopup.destroy();
            }
        } else {
            freeSpinsPromotionHandler.setShouldSkipGiftCode(true);
        }
        uiManager.emitter.emit(FreeSpinsPromotionEvents.OPEN_PROMOTION_DETAILS_PANEL, true);
        appManager.hasShowedCenterBanner = true;
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
