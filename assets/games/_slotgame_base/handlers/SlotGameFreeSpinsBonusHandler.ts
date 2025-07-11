import GameUtils from "../../../common/GameUtils";
import GiftCodeSkeleton from "../../../common/GiftCodeSkeleton";
import FreeSpinsPromotionHandler, { FreeSpinsPromotionEvents } from "../../../lobby/free-spin-bonus-promotion/FreeSpinsPromotionHandler";
import { uiManager } from "../../../managers/GameUIManager";
import { ClassicSlotSound } from "../ClassicSlotSound";
import { TurnOverRequiredEvents } from "../../../lobby/free-spin-bonus-promotion/TurnOverRequiredHandler";

export default class SlotGameFreeSpinsBonusHandler {
    private readonly game: any;
    private readonly DEFAULT_POPUP_PARENT_PATH = "Canvas/main/BoardGroup/other/number_col_left";
    public isMessageContentShown = false;
    constructor(game: any) {
        this.game = game;
    }

    isPromotionActive(): boolean {
        return (this.promotionPanel?.isPromotionStillActive?.() ?? false) && !this.isExtraFreeSpinsBonusInGame();
    }

    get promotionPanel() {
        return GameUtils.findNodeByNameRecursive(cc.find("Canvas"), "PromotionDetailsPanel")?.getComponent("PromotionDetailsPanel") ?? null;
    }

    tryAutoSpinWhenFSB = () => {
        if (!this.game.isSpinnedAction && !this.game.isAnimatingResult && this.game.spinButton && this.game.spinButton.node.active) {
            setTimeout(() => {
                this.game.spin();
            }, 500);
        }
    };

    registerEvents() {
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

        uiManager.emitterListener(TurnOverRequiredEvents.OPEN_TURN_OVER_REQUIRED, (promotionTOProgress) => this.showTurnOverRequiredPanel(promotionTOProgress), this.game);
    }

    async showTurnOverRequiredPanel(promotionTOProgress: any) {
        await GameUtils.showFreeSpinsPromotionPopupOnce(
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
        await GameUtils.showFreeSpinsPromotionPopupOnce(
            "GiftCodePopup",
            "free-spins-promotion/views/gift-code",
            this.DEFAULT_POPUP_PARENT_PATH
        );
        FreeSpinsPromotionHandler.getInstance().setFallbackGameOffers({ name: this.game?.gameName, gameId: this.game?.gameId });
    }

    async showGiftCodeRedeemPopup() {
        const transition = await this.playGiftCodeTransitionEffect();
        if (cc.isValid(transition)) {
            transition.destroy();
        }
    }

    async showPromotionEndedPopup(finishPromotion: any) {
        await GameUtils.showFreeSpinsPromotionPopupOnce(
            "PromotionEndedPopup",
            "free-spins-promotion/views/promotion-ended-popup",
            null,
            (node) => {
                const popupComp = node.getComponent("PromotionEndedPopup");
                popupComp?.show?.(finishPromotion);
                this.isMessageContentShown = false;
            }
        );
    }

    isExtraFreeSpinsBonusInGame() {
        return FreeSpinsPromotionHandler.getInstance().getExtraFreeSpinsBonusInGame();
    }

    async showPromotionDetailsPanel(isAutoSpin: boolean, triggerAfterFreeSpinInGame = false) {
        if (this.shouldShowMessageInsteadOfPopup()) {
            this.showFreeSpinMessageOnce();
            return;
        }

        const promotionInfo = FreeSpinsPromotionHandler.getInstance().getNormalizedPromotionInfo();
        if (!promotionInfo?.promotion?.isClaimed) {
            return;
        }

        const delayTime = triggerAfterFreeSpinInGame ? 0 : (isAutoSpin ? 900 : 0);
        await this.delay(delayTime);
        await GameUtils.showFreeSpinsPromotionPopupOnce(
            "PromotionDetailsPanel",
            "free-spins-promotion/views/promotion-details-panel",
            this.DEFAULT_POPUP_PARENT_PATH,
            (node) => {
                if (isAutoSpin) {
                    this.animatePopupAppearance(node);
                }
                const panelComp = node.getComponent("PromotionDetailsPanel");
                panelComp?.initPromotion?.(promotionInfo, isAutoSpin);
            }
        );
    }
    private shouldShowMessageInsteadOfPopup(): boolean {
        return this.game.isFreeSpin() && !this.isExtraFreeSpinsBonusInGame();
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
        FreeSpinsPromotionHandler.getInstance().setIsTransitionEffectActive(false);
        return effect;
    }

    async showGiftCodePopup() {
        await GameUtils.showFreeSpinsPromotionPopupOnce(
            "GiftCodeRedeemPopup",
            "free-spins-promotion/views/gift-code-redeem",
            null,
            (node) => {
                const popupComp = node.getComponent("GiftCodeRedeemPopup");
                popupComp.init(this.game?.socket, this.game?.gameName);
            }
        );
    }
}
