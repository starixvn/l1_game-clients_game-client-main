import { freeSpinsPromotionHandler } from "../../../lobby/free-spin-bonus-promotion/FreeSpinsPromotionHandler";
import SlotGameBase from "../SlotGameBase";
import DataHandler from "../../_base/handlers/DataHandler";

export default class SlotGameFreeSpinsHandler implements DataHandler {
    constructor(protected readonly main: SlotGameBase) {}

    handle(data: any) {
        const rawPromotion = data?.promotion;
        const redeemResult = data?.redeemResult;
        if (redeemResult === 1) {
            freeSpinsPromotionHandler.activeTransitionEffect = true;
        }
        if (rawPromotion) {
            freeSpinsPromotionHandler.setPromotionData({ promotion: rawPromotion }, true);
            freeSpinsPromotionHandler.handlePromotionDisplay();
            const betLevel = rawPromotion.betLevel;

            if (typeof betLevel === "number") {
                this.main.setPromotionBetLevel(betLevel);
            }
        }
    }
}
