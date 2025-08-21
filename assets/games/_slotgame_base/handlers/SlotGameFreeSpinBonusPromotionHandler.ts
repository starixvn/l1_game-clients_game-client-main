import SlotGameBase from "../SlotGameBase";
import DataHandler from "../../_base/handlers/DataHandler";
import { FreeSpinsPromotionEvents, freeSpinsPromotionHandler } from "../../../lobby/free-spin-bonus-promotion/FreeSpinsPromotionHandler";
import { turnOverRequiredHandler } from "../../../lobby/free-spin-bonus-promotion/TurnOverRequiredHandler";
import { uiManager } from "../../../managers/GameUIManager";

export default class SlotGameFreeSpinBonusPromotionHandler implements DataHandler {
  constructor(protected readonly main: SlotGameBase) {}

  handle(data: any) {
    if (!data) {
      return;
    }

    this.handlePromotion(data.promotion);
    if (data.finishPromotion) {
      this.processFinishPromotion(data.finishPromotion);
    }
    if (data.promotionTOProgress) {
      this.processTurnOverRequired(data.promotionTOProgress);
    }
    if (data.errorCode) {
      this.emitErrors(data.errorCode);
    }
    if (data.claimedAmount) {
      this.emitClaimedBonus(data.claimedAmount);
    }
    if (data.redeemResult) {
      this.handleRedeemResult(data.redeemResult, data.redemptionNotice);
    }
  }


  private handlePromotion(rawPromotion: any): void {
    if (!rawPromotion) {
      return;
    }

    freeSpinsPromotionHandler.setPromotionData({ promotion: rawPromotion }, true);
    freeSpinsPromotionHandler.handlePromotionDisplay();

    this.applyBetLevel(rawPromotion.betLevel);
    if (freeSpinsPromotionHandler.isPromotionConsumed(rawPromotion)) {
      this.disableStakeAndLines();
    }
  }

  private applyBetLevel(betLevel: unknown): void {
    if (typeof betLevel === "number") {
      this.main.setPromotionBetLevel(betLevel);
    }
  }

  private disableStakeAndLines(): void {
    if (this.main.stakeButton) {
      this.main.stakeButton.interactable = false;
    }
    this.main.lineButtonStatus(false);
    if (this.main.autoSpinToggle) {
      this.main.autoSpinToggle.interactable = false;
    }
  }

  private emitErrors(errorCode: string): void {
    if (errorCode === "SB3023") {
      uiManager.emitter.emit(FreeSpinsPromotionEvents.EXPIRE_CLAIM_BONUS);
    }
    uiManager.emitter.emit(FreeSpinsPromotionEvents.SHOW_NOTICE_ERROR, errorCode);
  }

  private emitClaimedBonus(amount: number): void {
    uiManager.emitter.emit(FreeSpinsPromotionEvents.CLAIMED_BONUS_SUCCESS, amount);
  }

  private handleRedeemResult(result: number, redemptionNotice?: string): void {
    if (result === 1) {
      freeSpinsPromotionHandler.activeTransitionEffect = true;
      uiManager.emitter.emit(FreeSpinsPromotionEvents.OPEN_REDEEM_TRANSITION_EFFECT);
    } else if (result === -1) {
      uiManager.emitter.emit(FreeSpinsPromotionEvents.REDEEM_GIFT_CODE_ERROR, redemptionNotice);
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
