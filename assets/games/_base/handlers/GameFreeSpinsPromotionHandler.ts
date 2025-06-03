import { freeSpinsPromotionHandler } from "../../../lobby/promotions/FreeSpinsPromotionHandler";
import IGameBase from "../IGameBase";
import DataHandler from "./DataHandler";

export default class FreeSpinsPromotionHandler implements DataHandler {
    constructor(protected readonly main: IGameBase) {}

    handle(data: any) {
        if (!data.promotionInfo) {
            return;
        }

        const promotionInfo = {
            promotion: {
                playerId: "17071999",
                siteName: "lumi",
                createdAt: "2025-06-02T08:35:08.224Z",
                currencyGroup: "61b953ad815d6c000196a14c",
                lastUsedDate: null,
                operatorId: "ONEworksVGCash",
                promotionCode: "brian_test_promotion_free_spins",
                promotionId: "683d2423b1a9f2086e273c31",
                remainingBonusItems: 100,
                updatedAt: "2025-06-02T08:35:08.224Z",
                __v: 0,
                _id: "683d623cb1a9f2086e274722"
            },
            gameOfferPromotion: [
                {
                    gameId: 76,
                    name: "dragonball"
                }
            ]
        };

        freeSpinsPromotionHandler.setPromotionInfoFromSso(data.promotionInfo);
        
    }
}
