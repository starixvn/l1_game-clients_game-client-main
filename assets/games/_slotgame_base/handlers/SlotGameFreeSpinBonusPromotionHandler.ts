import SlotGameBase from "../SlotGameBase";
import DataHandler from "../../_base/handlers/DataHandler";
import { FreeSpinsPromotionEvents, freeSpinsPromotionHandler } from "../../../lobby/free-spin-bonus-promotion/FreeSpinsPromotionHandler";
import { turnOverRequiredHandler } from "../../../lobby/free-spin-bonus-promotion/TurnOverRequiredHandler";
import { uiManager } from "../../../managers/GameUIManager";
export default class SlotGameFreeSpinBonusPromotionHandler implements DataHandler {
    constructor(protected readonly main: SlotGameBase) {}

    handle(data: any) {
        if (data?.promotion) {
            const rawPromotion = data.promotion;
            freeSpinsPromotionHandler.setPromotionData({ promotion: rawPromotion }, true);
            freeSpinsPromotionHandler.handlePromotionDisplay();
            const betLevel = rawPromotion.betLevel;

            if (typeof betLevel === "number") {
                this.main.setPromotionBetLevel(betLevel);
            }
        }

        if (data?.finishPromotion) {
            this.processFinishPromotion(data.finishPromotion);
        }

        if (data?.promotionTOProgress) {
            this.processTurnOverRequired(data.promotionTOProgress);
        }

        if (data.errorCode) {
            if (data.errorCode === "SB3023") {
                uiManager.emitter.emit(FreeSpinsPromotionEvents.EXPIRE_CLAIM_BONUS);
            }
            uiManager.emitter.emit(FreeSpinsPromotionEvents.SHOW_NOTICE_ERROR, data.errorCode);
        }

        if (data.claimedAmount) {
            uiManager.emitter.emit(FreeSpinsPromotionEvents.CLAIMED_BONUS_SUCCESS, data.claimedAmount);
        }

        if (data.redeemResult) {
            if (data.redeemResult === 1) {
                freeSpinsPromotionHandler.activeTransitionEffect = true;
                uiManager.emitter.emit(FreeSpinsPromotionEvents.OPEN_REDEEM_TRANSITION_EFFECT);
            } else if (data.redeemResult === -1) {
                uiManager.emitter.emit(FreeSpinsPromotionEvents.REDEEM_GIFT_CODE_ERROR, data.redemptionNotice);
            }
        }
    }

    private processFinishPromotion(finishPromotion: any): void {
        freeSpinsPromotionHandler.finishPromotion = finishPromotion;
        freeSpinsPromotionHandler.markServerConfirmedEnd();
    }

    private processTurnOverRequired(promotionTOProgress: any): void {
        turnOverRequiredHandler.toProgress = promotionTOProgress;
        freeSpinsPromotionHandler.promotionIdFromTO = promotionTOProgress?.promotionId;
        const hasFinishPromotion = freeSpinsPromotionHandler.finishPromotion;
        if (!hasFinishPromotion) {
            turnOverRequiredHandler.displayTurnOverRequired();
        }
    }
}
