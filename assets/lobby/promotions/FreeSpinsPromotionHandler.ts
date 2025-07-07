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
    OPEN_PROMOTION_ENDED_POPUP: "OPEN_PROMOTION_ENDED_POPUP",
    CHECK_IS_SPINNING: "CHECK_IS_SPINNING",
    OPEN_REDEEM_TRANSITION_EFFECT: "OPEN_REDEEM_TRANSITION_EFFECT",
    OPEN_TURN_OVER_REQUIRED: "OPEN_TURN_OVER_REQUIRED"
};

const endpointConstants = {
    bannerPromotion: "banner-promotions",
    announcementDetails: "announcement-detail"
};

interface StandardPromotionInfo {
    promotionId: string;
    code?: string;
    isGiftCode?: boolean;
    isClaimed?: boolean;
    remainingBonusItems?: number;
    initialBonusItem?: number;
    [key: string]: any;
}

export default class FreeSpinsPromotionHandler extends EventEmitterBase {
    private static instance: FreeSpinsPromotionHandler;
    private promotionInfoFromSso: any = null;

    private previousGameOfferPromotion?: any[];
    public isDirectlyOpen = false;
    private readonly storageKey = "free-spins-promotion-dont-show-again";
    private shouldSkipGiftCode = false;

    private finishPromotion: any = null;

    private extraFreeSpinsBonusInGame = false;

    private isTransitionEffectActive = false;

    private isAnnouncementDetailsActive = false;

    public getIsAnnouncementDetailsActive() {
        return this.isAnnouncementDetailsActive;
    }

    public setIsAnnouncementDetailsActive(isActive: boolean) {
        this.isAnnouncementDetailsActive = isActive;
    }

    public getIsTransitionEffectActive() {
        return this.isTransitionEffectActive;
    }

    public setIsTransitionEffectActive(isActive: boolean) {
        this.isTransitionEffectActive = isActive;
    }

    public setShouldSkipGiftCode(skip: boolean) {
        this.shouldSkipGiftCode = skip;
    }

    public setFinishPromotion(promotion: any) {
        this.finishPromotion = promotion;
    }

    public setExtraFreeSpinsBonusInGame(extraFreeSpinsBonusInGame: boolean) {
        this.extraFreeSpinsBonusInGame = extraFreeSpinsBonusInGame;
    }

    public getExtraFreeSpinsBonusInGame() {
        return this.extraFreeSpinsBonusInGame;
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
        console.log("promotionInfo", this.promotionInfoFromSso);
        this.isDirectlyOpen = isDirectly;
        this.handlePromotionDisplay();
    }

    private normalizePromotionData(data: any): { promotion: StandardPromotionInfo; gameOfferPromotion?: any[] } {
        const rawPromo = data?.promotion;
        const currentGameOfferPromotion =
            data?.gameOfferPromotion !== undefined ? data.gameOfferPromotion : this.previousGameOfferPromotion;
        this.previousGameOfferPromotion = currentGameOfferPromotion;
        return {
            promotion: {
                promotionId: rawPromo?.promotionId,
                code: rawPromo?.code || rawPromo?.promotionCode,
                isGiftCode: rawPromo?.isGiftCode === true,
                isClaimed: rawPromo?.isClaimed === true,
                ...rawPromo
            },
            gameOfferPromotion: currentGameOfferPromotion
        };
    }

    public getNormalizedPromotionInfo() {
        return this.promotionInfoFromSso;
    }

    public handlePromotionDisplay() {
        try {
            if (this.isTransitionEffectActive) {
                return;
            }

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
                    uiManager.emitter.emit(FreeSpinsPromotionEvents.OPEN_PROMOTION_DETAILS_PANEL, true);
                    return;
                }
                const isGiftCode = promotion?.isGiftCode === true;
                const remaining = promotion?.remainingBonusItems;
                const initial = promotion?.initialBonusItem;
                const isClaimed = promotion?.isClaimed === true;
                if (isGiftCode && !isClaimed) {
                    uiManager.emitter.emit(FreeSpinsPromotionEvents.OPEN_GIFT_CODE);
                } else if (isClaimed && remaining === initial) {
                    uiManager.emitter.emit(FreeSpinsPromotionEvents.OPEN_FREE_SPINS_PROMOTION);
                } else {
                    uiManager.emitter.emit(FreeSpinsPromotionEvents.OPEN_PROMOTION_DETAILS_PANEL);
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
        const endpoint = this.isAnnouncementDetailsActive ? endpointConstants.announcementDetails : endpointConstants.bannerPromotion;
        return `${buildPromotionSiteUrl()}/${endpoint}?${queryString}`;
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
