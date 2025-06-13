import SlotGameBase from "../../_slotgame_base/SlotGameBase";
import DataHandler from "./DataHandler";
import FreeSpinsPromotionHandler from "../../../lobby/promotions/FreeSpinsPromotionHandler";
export default class SlotGameEndPromotionHandler implements DataHandler {
    constructor(protected readonly main: SlotGameBase) {}

    handle(data: any) {
        const finishPromotion  = data?.finishPromotion ;
        if (finishPromotion ) {
            FreeSpinsPromotionHandler.getInstance().setFinishPromotion(finishPromotion);
        }
    }
}
