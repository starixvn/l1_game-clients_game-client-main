import GameUtils from "../../../common/GameUtils";
import GiftCodeSkeleton from "../../../common/GiftCodeSkeleton";
import FreeSpinsPromotionHandler, {
    FreeSpinsPromotionEvents,
    freeSpinsPromotionHandler
} from "../../../lobby/free-spin-bonus-promotion/FreeSpinsPromotionHandler";
import { uiManager } from "../../../managers/GameUIManager";
import { ClassicSlotSound } from "../ClassicSlotSound";
import { TurnOverRequiredEvents } from "../../../lobby/free-spin-bonus-promotion/TurnOverRequiredHandler";

export default class SlotGameFreeSpinsBonusHandler {
    private readonly game: any;
    private readonly DEFAULT_POPUP_PARENT_PATH = "Canvas/main/BoardGroup/other/number_col_left";
    public isMessageContentShown = false;
    
    public promotionPanel = null;

    constructor(game: any) {
        this.game = game;
    }

    isPromotionActive(): boolean {
        return (this.promotionPanel?.isStillActive?.() ?? false) && !this.isExtraFSBonusInGame();
    }
    tryAutoSpinWhenFSB = () => {
        if (!this.game.isSpinnedAction && !this.game.isAnimatingResult && this.game.spinButton && this.game.spinButton.node.active) {
            setTimeout(() => {
                this.game.spin();
            }, 500);
        }
    };

    registerEvents() {
        freeSpinsPromotionHandler.setFallbackGameOffers({ name: this.game?.gameName, gameId: this.game?.gameId });
        uiManager.emitterListener(FreeSpinsPromotionEvents.OPEN_GIFT_CODE, () => this.showGiftCode(), this.game);

        uiManager.emitterListener(FreeSpinsPromotionEvents.OPEN_GIFT_CODE_REDEEM_POPUP, () => this.showGiftCodeRedeemPopup(), this.game);

        uiManager.emitterListener(
            FreeSpinsPromotionEvents.OPEN_PROMOTION_DETAILS_PANEL,
            (isAutoSpin = false) => this.showPromotionDetailsPanel(isAutoSpin),
            this.game
        );

        uiManager.emitterListener(
            FreeSpinsPromotionEvents.OPEN_PROMOTION_ENDED_POPUP,
            (finishPromotion) => this.showPromotionEndedPopup(finishPromotion),
            this.game
        );

        uiManager.emitterListener(
            FreeSpinsPromotionEvents.OPEN_REDEEM_TRANSITION_EFFECT,
            () => this.playRedeemTransitionEffect(),
            this.game
        );

        uiManager.emitterListener(
            TurnOverRequiredEvents.OPEN_TURN_OVER_REQUIRED,
            (promotionTOProgress) => this.showTurnOverRequiredPanel(promotionTOProgress),
            this.game
        );

        uiManager.emitterListener(
            TurnOverRequiredEvents.OPEN_CLAIM_BONUS_NOTIFICATION,
            (claimBonus) => this.showClaimBonusNotification(claimBonus),
            this.game
        );

        uiManager.emitterListener(TurnOverRequiredEvents.UPDATE_BALANCE_BONUS, () => this.updateBalanceBonus(), this.game);
    }

    updateBalanceBonus() {
        this.game?.updateUserBalance();
    }

    async showClaimBonusNotification(claimBonus: any) {
        await this.showFreeSpinsPromotionPopupOnce(
            "ClaimBonusNotificationPopup",
            "free-spins-promotion/views/claim-bonus-notification",
            (node) => {
                const popupComp = node.getComponent("ClaimBonusNotificationPopup");
                popupComp.show(claimBonus);
            }
        );
    }

    async showTurnOverRequiredPanel(promotionTOProgress: any) {
        await this.showFreeSpinsPromotionPanel(
            "TurnOverRequiredPanel",
            "free-spins-promotion/views/turn-over-required-panel",
            this.DEFAULT_POPUP_PARENT_PATH,
            (node) => {
                const popupComp = node.getComponent("TurnOverRequiredPanel");
                popupComp.init(this.game?.socket, this.game?.gameName, promotionTOProgress);
            }
        );
    }

    async showGiftCode() {
        await this.showFreeSpinsPromotionPanel("GiftCodePopup", "free-spins-promotion/views/gift-code", this.DEFAULT_POPUP_PARENT_PATH, (node) => {
            freeSpinsPromotionHandler.giftCodeNode = node;
        });
    }

    async showGiftCodeRedeemPopup() {
        if (this.game?.isSpinnedAction || this.game?.stillAutoSpin()) {
            return;
        }
        const transition = await this.playGiftCodeTransitionEffect();
        if (cc.isValid(transition)) {
            transition.destroy();
        }
    }

    async showPromotionEndedPopup(finishPromotion: any) {
        await this.showFreeSpinsPromotionPopupOnce("PromotionEndedPopup", "free-spins-promotion/views/promotion-ended-popup", (node) => {
            const popupComp = node.getComponent("PromotionEndedPopup");
            popupComp?.show?.(finishPromotion);
            this.isMessageContentShown = false;
        });
    }

    isExtraFSBonusInGame() {
        return FreeSpinsPromotionHandler.getInstance().extraFSBonusInGame;
    }

    async showPromotionDetailsPanel(isAutoSpin: boolean, triggerAfterFreeSpinInGame = false) {
        if (this.shouldShowMessageInsteadOfPopup()) {
            this.showFreeSpinMessageOnce();
            return;
        }

        const promotionInfo = FreeSpinsPromotionHandler.getInstance().getPromo();
        if (!promotionInfo?.promotion?.isClaimed) {
            return;
        }
        const delayTime = triggerAfterFreeSpinInGame ? 0 : isAutoSpin ? 900 : 0;
        await this.delay(delayTime);
        await this.showFreeSpinsPromotionPanel(
            "PromotionDetailsPanel",
            "free-spins-promotion/views/promotion-details-panel",
            this.DEFAULT_POPUP_PARENT_PATH,
            (node) => {
                if (isAutoSpin) {
                    this.animatePopupAppearance(node);
                }
                const panelComp = node.getComponent("PromotionDetailsPanel");
                panelComp?.initPromotion?.(promotionInfo, isAutoSpin);
                this.promotionPanel = panelComp;
            }
        );
    }
    private shouldShowMessageInsteadOfPopup(): boolean {
        return this.game.isFreeSpin() && !this.isExtraFSBonusInGame();
    }

    private showFreeSpinMessageOnce(): void {
        if (!this.isMessageContentShown) {
            this.isMessageContentShown = true;
            this.game.freeSpinsPromotionMessage?.showMessageContent();
        }
    }
    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    private animatePopupAppearance(node: cc.Node): void {
        node.opacity = 0;
        node.scale = 0.8;
        cc.tween(node).to(0.8, { opacity: 255, scale: 1.0 }, { easing: "quadOut" }).start();
    }

    async initFreeSpinsPromotionMessage() {
        const existing = cc.find("Canvas/FreeSpinsPromotionMessage");
        if (existing) {
            this.game.freeSpinsPromotionMessage = existing.getComponent("FreeSpinsPromotionMessage");
            return;
        }

        const prefab = await GameUtils.loadResource("free-spins-promotion/views/free-spins-promotion-message");
        const node = cc.instantiate(prefab);
        node.active = false;
        node.name = "FreeSpinsPromotionMessage";
        node.parent = cc.find("Canvas");
        this.game.freeSpinsPromotionMessage = node.getComponent("FreeSpinsPromotionMessage");
    }

    async playGiftCodeTransitionEffect() {
        const effectPrefab = await GameUtils.loadResource("free-spins-promotion/views/effect-gift-code-transition");
        if (!effectPrefab) {
            return null;
        }
        this.game.playSound?.(ClassicSlotSound.TRANSITION);
        const effect = cc.instantiate(effectPrefab);
        const callbackAnim = effect.getComponent(GiftCodeSkeleton);
        callbackAnim.onShowPopup = () => this.showGiftCodePopup();
        await GameUtils.asyncExecute(this.game.node, this.game.showEffect(effect));
        return effect;
    }

    async playRedeemTransitionEffect() {
        const effectPrefab = await GameUtils.loadResource("free-spins-promotion/views/effect-redeem-transition");
        if (!effectPrefab) {
            return null;
        }
        this.game.playSound?.(ClassicSlotSound.TRANSITION);
        const effect = cc.instantiate(effectPrefab);
        const callbackAnim = effect.getComponent(GiftCodeSkeleton);
        callbackAnim.onShowPopup = () => uiManager.emitter.emit(FreeSpinsPromotionEvents.OPEN_FREE_SPINS_PROMOTION);
        await GameUtils.asyncExecute(this.game?.node ?? cc.find("Canvas"), this.game.showEffect(effect));
        FreeSpinsPromotionHandler.getInstance().activeTransitionEffect = false;
        return effect;
    }

    async showGiftCodePopup() {
        await this.showFreeSpinsPromotionPopupOnce("GiftCodeRedeemPopup", "free-spins-promotion/views/gift-code-redeem", (node) => {
            const popupComp = node.getComponent("GiftCodeRedeemPopup");
            popupComp.init(this.game?.socket, this.game?.gameName);
        });
    }

    public async showFreeSpinsPromotionPanel(
        name: string,
        path: string,
        alignToNodePath: string | null = null,
        afterLoadCallback?: (node: cc.Node) => void
    ) {
        const refNode = alignToNodePath ? cc.find(alignToNodePath) : null;

        if (alignToNodePath && !refNode) {
            cc.warn(`[UI] Không tìm thấy node tại path: ${alignToNodePath}`);
            return;
        }
        const parent = alignToNodePath ? cc.find("Canvas/main") : cc.find("Canvas");
        if (!parent) {
            cc.error("[UI] Không tìm thấy parent hợp lệ (Canvas hoặc Canvas/main).");
            return;
        }

        if (parent.getChildByName(name)) {
            console.log(`[UI] Popup "${name}" đã tồn tại`);
            return;
        }
        const prefab = await GameUtils.loadResource(path);
        const node = cc.instantiate(prefab);
        node.name = name;
        node.parent = parent;
        const indexBelowOverlay = 3;
        node.setSiblingIndex(parent.children.length - indexBelowOverlay);
        if (refNode) {
            const refBox = refNode.getBoundingBoxToWorld();
            const panelBox = node.getBoundingBoxToWorld();

            const panelWidth = panelBox.width;
            const spacingFromRef = -20; // khoảng cách giữa refNode và panel
            const worldTargetX = refBox.xMin - spacingFromRef - panelWidth / 2;
            const worldTargetY = refBox.yMin + refBox.height / 2;

            const localPos = parent.convertToNodeSpaceAR(cc.v2(worldTargetX, worldTargetY));
            node.setPosition(localPos);
        } else {
            node.setPosition(0, 0);
        }

        afterLoadCallback?.(node);
    }

    public async showFreeSpinsPromotionPopupOnce(name: string, path: string, afterLoadCallback?: (node: cc.Node) => void) {
        const miniPanel = this.game.currentMiniPanel;

        if (!miniPanel?.addDialog || typeof miniPanel.addDialog !== "function") {
            return;
        }

        if (miniPanel?.dialog?.getChildByName(name)) {
            return;
        }

        try {
            const prefab = await GameUtils.loadResource(path);
            if (!prefab) {
                console.warn(`Prefab not found at path: ${path}`);
                return;
            }

            const node = cc.instantiate(prefab);
            node.name = name;
            this.game.currentMiniPanel.addDialog(node);

            afterLoadCallback?.(node);
        } catch (error) {
            console.error(`Error loading FreeSpinsPromotionPopup: ${error}`);
        }
    }
}
