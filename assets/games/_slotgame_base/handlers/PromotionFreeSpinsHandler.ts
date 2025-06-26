import GameUtils from "../../../common/GameUtils";
import FreeSpinsPromotionHandler, { FreeSpinsPromotionEvents } from "../../../lobby/promotions/FreeSpinsPromotionHandler";
import { uiManager } from "../../../managers/GameUIManager";

export default class PromotionFreeSpinsHandler {
    private readonly game: any;

    constructor(game: any) {
        this.game = game;
    }

    isPromotionActive(): boolean {
        return this.promotionPanel?.isPromotionStillActive?.() ?? false;
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

        uiManager.emitterListener(FreeSpinsPromotionEvents.OPEN_PROMOTION_DETAILS_PANEL, () => this.showPromotionDetailsPanel(), this.game);

        uiManager.emitterListener(
            FreeSpinsPromotionEvents.OPEN_PROMOTION_ENDED_POPUP,
            (finishPromotion) => this.showPromotionEndedPopup(finishPromotion),
            this.game
        );
    }

    async showGiftCode() {
        await GameUtils.showFreeSpinsPromotionPopupOnce(
            "GiftCodePopup",
            "free-spins-promotion/views/gift-code",
            "Canvas/main/BoardGroup/other/number_col_left"
        );
    }

    async showGiftCodeRedeemPopup() {
        if (this.game.isFreeSpin()) {
            this.game.freeSpinsPromotionMessage?.showMessageContent();
            return;
        }

        const transition = await this.game.playEffectTransition();
        await GameUtils.showFreeSpinsPromotionPopupOnce("GiftCodeRedeemPopup", "free-spins-promotion/views/gift-code-redeem");
        transition?.destroy();
    }
    async showPromotionEndedPopup(finishPromotion: any) {
        await GameUtils.showFreeSpinsPromotionPopupOnce(
            "PromotionEndedPopup",
            "free-spins-promotion/views/promotion-ended-popup",
            null,
            (node) => {
                const popupComp = node.getComponent("PromotionEndedPopup");
                popupComp?.show?.(finishPromotion);
            }
        );
    }
    async showPromotionDetailsPanel() {
        const transition = await this.game?.playEffectTransition();
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await GameUtils.showFreeSpinsPromotionPopupOnce(
            "PromotionDetailsPanel",
            "free-spins-promotion/views/promotion-details-panel",
            "Canvas/main/BoardGroup/other/number_col_left",
            (node) => {
                const promotionInfo = FreeSpinsPromotionHandler.getInstance().getNormalizedPromotionInfo();
                const panelComp = node.getComponent("PromotionDetailsPanel");
                panelComp?.initPromotion?.(promotionInfo);
            }
        );
        transition?.destroy();
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
}
