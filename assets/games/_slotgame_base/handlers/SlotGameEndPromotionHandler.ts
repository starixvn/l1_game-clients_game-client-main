import SlotGameBase from "../SlotGameBase";
import DataHandler from "../../_base/handlers/DataHandler";
import { FreeSpinsPromotionEvents, freeSpinsPromotionHandler } from "../../../lobby/free-spin-bonus-promotion/FreeSpinsPromotionHandler";
import { uiManager } from "../../../managers/GameUIManager";
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
        freeSpinsPromotionHandler.setFinishPromotion(finishPromotion);

        const promotionPanel = this.main.freeSpinsBonusHandler?.promotionPanel;
        if (promotionPanel) {
            promotionPanel.markServerConfirmedEnd();
        } else {
            uiManager.emitter.emit(FreeSpinsPromotionEvents.OPEN_PROMOTION_ENDED_POPUP, finishPromotion);
        }
    }

    private processTurnOverRequired(promotionTOProgress: any): void {
        turnOverRequiredHandler.setPromotionTOProgress(promotionTOProgress);

        const hasFinishPromotion = freeSpinsPromotionHandler.getFinishPromotion();
        if (!hasFinishPromotion) {
            turnOverRequiredHandler.displayTurnOverRequired();
        }
    }
}
