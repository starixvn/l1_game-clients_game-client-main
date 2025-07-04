import { freeSpinsPromotionHandler } from "../../../lobby/promotions/FreeSpinsPromotionHandler";
import SlotGameBase from "../../_slotgame_base/SlotGameBase";
import DataHandler from "./DataHandler";

export default class SlotGameFreeSpinsHandler implements DataHandler {
    constructor(protected readonly main: SlotGameBase) {}

    handle(data: any) {
        const rawPromotion = data?.promotion;
        const redeemResult = data?.redeemResult;
        if (redeemResult) {
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
