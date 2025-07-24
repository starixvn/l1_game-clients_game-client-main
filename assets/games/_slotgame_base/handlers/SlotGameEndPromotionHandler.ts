import SlotGameBase from "../SlotGameBase";
import DataHandler from "../../_base/handlers/DataHandler";
import { freeSpinsPromotionHandler } from "../../../lobby/free-spin-bonus-promotion/FreeSpinsPromotionHandler";
import { turnOverRequiredHandler } from "../../../lobby/free-spin-bonus-promotion/TurnOverRequiredHandler";
export default class SlotGameEndPromotionHandler implements DataHandler {
    constructor(protected readonly main: SlotGameBase) {}

    handle(data: any) {
        if (data?.finishPromotion) {
            this.processFinishPromotion(data.finishPromotion);
        }

        if (data?.promotionTOProgress) {
            this.processTurnOverRequired(data.promotionTOProgress);
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
