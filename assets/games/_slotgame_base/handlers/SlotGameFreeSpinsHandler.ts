import { freeSpinsPromotionHandler } from "../../../lobby/free-spin-bonus-promotion/FreeSpinsPromotionHandler";
import SlotGameBase from "../SlotGameBase";
import DataHandler from "../../_base/handlers/DataHandler";

export default class SlotGameFreeSpinsHandler implements DataHandler {
    constructor(protected readonly main: SlotGameBase) {}

    handle(data: any) {
        const rawPromotion = data?.promotion;
        const redeemResult = data?.redeemResult;
        if (redeemResult === 1) {
            freeSpinsPromotionHandler.setIsTransitionEffectActive(true);
        }
        if (rawPromotion) {
            freeSpinsPromotionHandler.setPromotionInfoFromSso({ promotion: rawPromotion }, true);
            const betLevel = rawPromotion.betLevel;

            if (typeof betLevel === "number") {
                this.main.setPromotionBetLevel(betLevel);
            }
        }
    }
}
