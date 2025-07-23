import * as sessionManager from "../../common/auth/SessionManager";
import EventEmitterBase from "../../common/emitter/EventEmitterBase";
import { buildPromotionSiteUrl } from "../../common/helpers/UrlHelper";
import { sentryLogger } from "../../common/logger";
import EncryptUtils from "../../common/utils/EncryptUtils";
import { uiManager } from "../../managers/GameUIManager";
import { StorageManager } from "../../managers/StorageManager";
import configs = require("../../configs/Configs");

export const FreeSpinsPromotionEvents = {
    OPEN_FREE_SPINS_PROMOTION: "OPEN_FREE_SPINS_PROMOTION",
    OPEN_GIFT_CODE: "OPEN_GIFT_CODE",
    OPEN_GIFT_CODE_REDEEM_POPUP: "OPEN_GIFT_CODE_REDEEM_POPUP",
    OPEN_PROMOTION_DETAILS_PANEL: "OPEN_PROMOTION_DETAILS_PANEL",
    SPIN_ON_FSB_PROMOTION: "SPIN_ON_FSB_PROMOTION",
    OPEN_PROMOTION_ENDED_POPUP: "OPEN_PROMOTION_ENDED_POPUP",
    OPEN_REDEEM_TRANSITION_EFFECT: "OPEN_REDEEM_TRANSITION_EFFECT",
    COLLAPSE_MENU: "COLLAPSE_MENU"
};

const endpointConstants = {
    bannerPromotion: "banner-promotions",
    announcementDetails: "announcement-detail"
};

interface StandardPromotionInfo {
    promotionId: string;
    isGiftCode?: boolean;
    isClaimed?: boolean;
    remainingBonusItems?: number;
    initialBonusItem?: number;
    [key: string]: any;
}

export default class FreeSpinsPromotionHandler extends EventEmitterBase {
    private static instance: FreeSpinsPromotionHandler;
    private promotionData: any = null;

    private previousGameOffered?: any[];
    private readonly storageKey = "free-spins-promotion-dont-show-again";
    public isDirectlyOpen = false;
    private _skipGiftCode = false;
    private _finishPromotion: any = null;
    private _extraFSBonusInGame = false;
    private _activeTransitionEffect = false;
    private _activeDetailPromo = false;
    private _currentSpinCount = 0;
    private _promotionIdFromTO = "";
    private readonly fallbackGameOffers: { name: string; gameId: number }[] = [];
    public giftCodeNode = null;

    public static getInstance(): FreeSpinsPromotionHandler {
        if (!this.instance) {
            this.instance = new FreeSpinsPromotionHandler();
        }
        return this.instance;
    }

    /** ========== CONFIGS / STATE ========== */
    getStorageKey() {
        return this.storageKey;
    }

    public getFallbackGameOffers() {
        return this.fallbackGameOffers;
    }

    public setFallbackGameOffers({ name, gameId }: { name: string; gameId: number }) {
        if (!name || typeof gameId !== "number") {
            return;
        }

        const exists = this.fallbackGameOffers.some((offer) => offer.gameId === gameId);
        if (!exists) {
            this.fallbackGameOffers.push({ name: name.toLowerCase(), gameId });
        }
    }

    get currentSpinCount() {
        return this._currentSpinCount;
    }

    set currentSpinCount(count: number) {
        this._currentSpinCount = count;
    }

    get activeDetailPromo() {
        return this._activeDetailPromo;
    }

    set activeDetailPromo(isActive: boolean) {
        this._activeDetailPromo = isActive;
    }

    get activeTransitionEffect() {
        return this._activeTransitionEffect;
    }

    set activeTransitionEffect(isActive: boolean) {
        this._activeTransitionEffect = isActive;
    }

    set shouldSkipGiftCode(skip: boolean) {
        this._skipGiftCode = skip;
    }

    set extraFSBonusInGame(extraFSBonusInGame: boolean) {
        this._extraFSBonusInGame = extraFSBonusInGame;
    }

    get extraFSBonusInGame() {
        return this._extraFSBonusInGame;
    }
    set finishPromotion(promotion: any) {
        this._finishPromotion = promotion;
    }

    get finishPromotion() {
        return this._finishPromotion;
    }

    set promotionIdFromTO(promotionId: string) {
        this._promotionIdFromTO = promotionId;
    }

    get promotionIdFromTO() {
        return this._promotionIdFromTO;
    }

    public reset() {
        this.finishPromotion = null;
        this.isDirectlyOpen = false;
        this.shouldSkipGiftCode = false;
        this.extraFSBonusInGame = false;
        this.activeTransitionEffect = false;
        this.activeDetailPromo = false;
    }

    /** ========== PROMOTION FLOW ========== */
    setPromotionData(rawData: any, isDirectly = false) {
        this.promotionData = this.normalizePromotionData(rawData);
        this.isDirectlyOpen = isDirectly;
        this.handlePromotionDisplay();
    }

    private normalizePromotionData(data: any): { promotion: StandardPromotionInfo; gameOfferPromotion?: any[] } {
        const rawPromo = data?.promotion;
        const currentGameOfferPromotion = data?.gameOfferPromotion !== undefined ? data.gameOfferPromotion : this.previousGameOffered;
        this.previousGameOffered = currentGameOfferPromotion;
        return {
            promotion: {
                promotionId: rawPromo?.promotionId,
                isGiftCode: rawPromo?.isGiftCode === true,
                isClaimed: rawPromo?.isClaimed === true,
                ...rawPromo
            },
            gameOfferPromotion: currentGameOfferPromotion
        };
    }

    public getPromo() {
        return this.promotionData;
    }

    public handlePromotionDisplay() {
        try {
            if (this.activeTransitionEffect || !this.hasPromo()) {
                return;
            }
            if (this.shouldSkipPromo()) {
                return;
            }

            if (this.isDirectlyOpen) {
                this.handleDirectOpen();
                return;
            }

            if (sessionManager.getCheckedFreeSpinsPromotionFirstSso()) {
                return;
            }
            uiManager.emitter.emit(FreeSpinsPromotionEvents.OPEN_FREE_SPINS_PROMOTION);
        } catch (error) {
            sentryLogger.log(`handlePromotionDisplay error: ${error.message}`);
        }
    }
    private hasPromo(): boolean {
        return !!this.promotionData?.promotion?.promotionId;
    }

    private shouldSkipPromo(): boolean {
        const dontShow = StorageManager.get(this.storageKey)?.dontShowAgain;
        const isSC1 = configs.systemType.toUpperCase() === "SC1";
        const isGiftCode = this.promotionData?.promotion?.isGiftCode === true;
        if (dontShow || (isGiftCode && !this.isDirectlyOpen)) {
            return true;
        }

        return isSC1;
    }

    private handleDirectOpen() {
        const promotion = this.promotionData?.promotion;
        const isGiftCode = promotion?.isGiftCode === true;
        const isClaimed = promotion?.isClaimed === true;
        const remaining = promotion?.remainingBonusItems;
        const initial = promotion?.initialBonusItem;

        if (this.shouldSkipGiftCode) {
            this.shouldSkipGiftCode = false;
            uiManager.emitter.emit(FreeSpinsPromotionEvents.OPEN_PROMOTION_DETAILS_PANEL, true);
            return;
        }

        if (isGiftCode && !isClaimed) {
            uiManager.emitter.emit(FreeSpinsPromotionEvents.OPEN_GIFT_CODE);
        } else if (isClaimed && remaining === initial) {
            uiManager.emitter.emit(FreeSpinsPromotionEvents.OPEN_FREE_SPINS_PROMOTION);
        } else {
            uiManager.emitter.emit(FreeSpinsPromotionEvents.OPEN_PROMOTION_DETAILS_PANEL);
        }
    }
    closePromoPopup() {
        sessionManager.setCheckedFreeSpinsPromotionFirstSso(true);
    }

    /** ========== GAME INFO HELPERS ========== */
    getGameId() {
        const offers = this.getGameOffered();
        return offers?.[0]?.gameId;
    }

    getGameOffered() {
        return this.promotionData?.gameOfferPromotion?.length > 0 ? this.promotionData.gameOfferPromotion : this.fallbackGameOffers;
    }

    /** ========== URL HELPERS ========== */
    getPromoUrl() {
        const promotionId = this.promotionData?.promotion?.promotionId || this.promotionIdFromTO;
        const gameOffers = this.getGameOffered();
        const queryString = this.getQueryString(promotionId, gameOffers);
        const endpoint = this.activeDetailPromo ? endpointConstants.announcementDetails : endpointConstants.bannerPromotion;
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
