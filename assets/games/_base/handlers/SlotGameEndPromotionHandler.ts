import { uiManager } from "../../../managers/GameUIManager";
import SlotGameBase from "../../_slotgame_base/SlotGameBase";
import DataHandler from "./DataHandler";
import { FreeSpinsPromotionEvents } from "../../../lobby/promotions/FreeSpinsPromotionHandler";
export default class SlotGameEndPromotionHandler implements DataHandler {
    constructor(protected readonly main: SlotGameBase) {}

    handle(data: any) {
        const finishPromotion  = data?.finishPromotion ;
        if (finishPromotion ) {
            uiManager.emitter.emit(FreeSpinsPromotionEvents.OPEN_PROMOTION_ENDED_POPUP, finishPromotion );
        }
    }
}
