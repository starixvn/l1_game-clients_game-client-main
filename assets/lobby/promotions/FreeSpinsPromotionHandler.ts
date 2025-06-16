import axios from "axios";
import { StorageManager } from "../../managers/StorageManager";
import * as sessionManager from "../../common/auth/SessionManager";
import EventEmitterBase from "../../common/emitter/EventEmitterBase";
import { buildPromotionSiteUrl } from "../../common/helpers/UrlHelper";
import { sentryLogger } from "../../common/logger";
import EncryptUtils from "../../common/utils/EncryptUtils";
import configs = require("../../configs/Configs");
import { uiManager } from "../../managers/GameUIManager";

export const FreeSpinsPromotionEvents = {
    OPEN_FREE_SPINS_PROMOTION: "OPEN_FREE_SPINS_PROMOTION",
    OPEN_GIFT_CODE: "OPEN_GIFT_CODE",
    OPEN_GIFT_CODE_REDEEM_POPUP: "OPEN_GIFT_CODE_REDEEM_POPUP",
    OPEN_PROMOTION_DETAILS_PANEL: "OPEN_PROMOTION_DETAILS_PANEL",
    SPIN_ON_FSB_PROMOTION: "SPIN_ON_FSB_PROMOTION",
    OPEN_PROMOTION_ENDED_POPUP: "OPEN_PROMOTION_ENDED_POPUP"
};

const endpointConstants = {
    bannerPromotion: "banner-promotions"
};

interface StandardPromotionInfo {
    promotionId: string;
    code?: string;
    isGiftCode?: boolean;
    remainingBonusItems?: number;
    [key: string]: any;
}

export default class FreeSpinsPromotionHandler extends EventEmitterBase {
    private static instance: FreeSpinsPromotionHandler;
    private promotionInfoFromSso: any = null;
    public isDirectlyOpen = false;
    private readonly storageKey = "free-spins-promotion-dont-show-again";
    private shouldSkipGiftCode = false;

    private finishPromotion: any = null;

    public setShouldSkipGiftCode(skip: boolean) {
        this.shouldSkipGiftCode = skip;
    }

    public setFinishPromotion(promotion: any) {
        this.finishPromotion = promotion;
    }

    public getFinishPromotion() {
        return this.finishPromotion;
    }

    public static getInstance(): FreeSpinsPromotionHandler {
        if (!this.instance) {
            this.instance = new FreeSpinsPromotionHandler();
        }
        return this.instance;
    }

    getStorageKey() {
        return this.storageKey;
    }

    onCloseFreeSpinsPromotionPopup() {
        sessionManager.setCheckedFreeSpinsPromotionFirstSso(true);
    }

    getGameId() {
        const offers = this.promotionInfoFromSso?.gameOfferPromotion;
        return offers?.[0]?.gameId;
    }

    setPromotionInfoFromSso(rawData: any, isDirectly = false) {
        this.promotionInfoFromSso = this.normalizePromotionData(rawData);
        this.isDirectlyOpen = isDirectly;
        this.handlePromotionDisplay();
    }

    private normalizePromotionData(data: any): { promotion: StandardPromotionInfo; gameOfferPromotion?: any[] } {
        const rawPromo = data?.promotion;
        const gamePromo = data?.promotionInfo?.promotion;

        const source = rawPromo?.promotionId ? rawPromo : gamePromo;

        return {
            promotion: {
                promotionId: source?.promotionId,
                code: source?.code || source?.promotionCode,
                isGiftCode: source?.isGiftCode === true,
                remainingBonusItems: source?.remainingBonusItems || source?.bonusItemCount,
                ...source
            },
            gameOfferPromotion: data?.gameOfferPromotion ?? data?.promotionInfo?.gameOfferPromotion
        };
    }

    public getNormalizedPromotionInfo() {
        return this.promotionInfoFromSso;
    }
    public handlePromotionDisplay() {
        try {
            const promotion = this.promotionInfoFromSso?.promotion;

            if (!promotion?.promotionId) {
                return;
            }

            const dontShow = StorageManager.get(this.storageKey)?.dontShowAgain;
            const isSC1 = configs.systemType.toUpperCase() === "SC1";
            if (dontShow || isSC1) {
                return;
            }

            if (this.isDirectlyOpen) {
                if (this.shouldSkipGiftCode) {
                    this.shouldSkipGiftCode = false; 
                    uiManager.emitter.emit(FreeSpinsPromotionEvents.OPEN_PROMOTION_DETAILS_PANEL);
                    return;
                }
                const isGiftCode = promotion?.isGiftCode === true;

                if (isGiftCode) {
                    uiManager.emitter.emit(FreeSpinsPromotionEvents.OPEN_GIFT_CODE);
                } else {
                    uiManager.emitter.emit(FreeSpinsPromotionEvents.OPEN_FREE_SPINS_PROMOTION);
                }
                return;
            }
            const alreadySeen = sessionManager.getCheckedFreeSpinsPromotionFirstSso();
            if (alreadySeen) {
                return;
            }

            uiManager.emitter.emit(FreeSpinsPromotionEvents.OPEN_FREE_SPINS_PROMOTION);
        } catch (error) {
            sentryLogger.log(`handlePromotionDisplay error: ${error.message}`);
        }
    }

    getFreeSpinsPromotionUrl() {
        const promotionId = this.promotionInfoFromSso?.promotion?.promotionId;
        const gameOffers = this.promotionInfoFromSso?.gameOfferPromotion;
        const queryString = this.getQueryString(promotionId, gameOffers);
        return `${buildPromotionSiteUrl()}/${endpointConstants.bannerPromotion}?${queryString}`;
    }

    private async getPromotionData(action: string, promotionId?: string) {
        try {
            const queryString = this.getQueryString(promotionId);
            const url = `${buildPromotionSiteUrl()}/${action}?${queryString}`;
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            sentryLogger.log(`getPromotionData failed: ${error.message}`);
            return false;
        }
    }

    private buildParams() {
        const session = sessionManager.getSession();
        return {
            sessionId: EncryptUtils.base64Encode(session?.ss || ""),
            username: session?.username,
            language: session?.language
        };
    }

    private getQueryString(promotionId?: string, gameOffers?: { gameId: number; name: string }[]) {
        const searchParams = new URLSearchParams();
        const params = this.buildParams();
        Object.keys(params).forEach((key) => {
            if (params[key] !== undefined) {
                searchParams.append(key, params[key]);
            }
        });

        if (promotionId) {
            searchParams.append("promotionId", promotionId);
        }
        if (gameOffers && Array.isArray(gameOffers)) {
            const jsonString = JSON.stringify(gameOffers);
            searchParams.append("game", jsonString);
        }

        return searchParams.toString();
    }
}

export const freeSpinsPromotionHandler = FreeSpinsPromotionHandler.getInstance();
