import SlotGameBase from "../../_slotgame_base/SlotGameBase";
import DataHandler from "./DataHandler";
import FreeSpinsPromotionHandler, { FreeSpinsPromotionEvents } from "../../../lobby/free-spin-bonus-promotion/FreeSpinsPromotionHandler";
import { uiManager } from "../../../managers/GameUIManager";
export default class SlotGameEndPromotionHandler implements DataHandler {
    constructor(protected readonly main: SlotGameBase) {}

    handle(data: any) {
        const finishPromotion = data?.finishPromotion;
        if (finishPromotion) {
            FreeSpinsPromotionHandler.getInstance().setFinishPromotion(finishPromotion);
            const promotionPanel = this.main.freeSpinsBonusHandler?.promotionPanel;
            if (promotionPanel) {
                promotionPanel.markServerConfirmedEnd();
            } else {
                uiManager.emitter.emit(FreeSpinsPromotionEvents.OPEN_PROMOTION_ENDED_POPUP, finishPromotion);
            }
        }
    }
}
