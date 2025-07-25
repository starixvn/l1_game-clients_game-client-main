import * as sessionManager from "../../common/auth/SessionManager";
import EventEmitterBase from "../../common/emitter/EventEmitterBase";
import { buildPromotionSiteUrl } from "../../common/helpers/UrlHelper";
import { sentryLogger } from "../../common/logger";
import EncryptUtils from "../../common/utils/EncryptUtils";
import { uiManager } from "../../managers/GameUIManager";
import { StorageManager } from "../../managers/StorageManager";
import configs = require("../../configs/Configs");
import { Socket } from "socket.io-client";

export const FreeSpinsPromotionEvents = {
    OPEN_FREE_SPINS_PROMOTION: "OPEN_FREE_SPINS_PROMOTION",
    OPEN_GIFT_CODE: "OPEN_GIFT_CODE",
    OPEN_GIFT_CODE_REDEEM_POPUP: "OPEN_GIFT_CODE_REDEEM_POPUP",
    OPEN_PROMOTION_DETAILS_PANEL: "OPEN_PROMOTION_DETAILS_PANEL",
    SPIN_ON_FSB_PROMOTION: "SPIN_ON_FSB_PROMOTION",
    OPEN_PROMOTION_ENDED_POPUP: "OPEN_PROMOTION_ENDED_POPUP",
    OPEN_REDEEM_TRANSITION_EFFECT: "OPEN_REDEEM_TRANSITION_EFFECT",
    COLLAPSE_MENU: "COLLAPSE_MENU",
    DESTROY_GIFT_CODE_NODE: "DESTROY_GIFT_CODE_NODE",
    CLOSE_PROMOTION_DETAILS_PANEL: "CLOSE_PROMOTION_DETAILS_PANEL",
    UPDATE_FSB_COUNT: "UPDATE_FSB_COUNT",
    UPDATE_TOTAL_WIN: "UPDATE_TOTAL_WIN",
    EXPIRE_CLAIM_BONUS: "EXPIRE_CLAIM_BONUS",
    SHOW_NOTICE_ERROR: "SHOW_NOTICE_ERROR",
    CLAIMED_BONUS_SUCCESS: "CLAIMED_BONUS_SUCCESS",
    REDEEM_GIFT_CODE_ERROR: "REDEEM_GIFT_CODE_ERROR"
};

const endpointConstants = {
    bannerPromotion: "banner-promotions",
    announcementDetails: "announcement-detail"
};
interface GameOfferPromotion {
    gameId: number;
    name: string;
}
interface StandardPromotionInfo {
    promotionId: string;
    isGiftCode?: boolean;
    isClaimed?: boolean;
    remainingBonusItems?: number;
    initialBonusItem?: number;
    betLevel?: number;
    isActive?: boolean;
    totalWin?: number;
}

interface PromotionData {
    promotion: StandardPromotionInfo;
    gameOfferPromotion?: GameOfferPromotion[];
}

interface FinishPromotion {
    endPromotion: boolean;
    totalWin: number;
}

export default class FreeSpinsPromotionHandler extends EventEmitterBase {
    private static instance: FreeSpinsPromotionHandler;
    private readonly storageKey = "free-spins-promotion-dont-show-again";
    public receivedPromotionInGame = false;
    private _skipGiftCode = false;
    private _finishPromotion: FinishPromotion;
    private _activeTransitionEffect = false;
    private _activeDetailPromo = false;
    private _currentSpinCount: number;
    private _promotionIdFromTO = "";
    private readonly fallbackGameOffers: { name: string; gameId: number }[] = [];
    public promotionData: PromotionData;
    public resumedFSBonus = false;
    public hasServerFinishPromotion = false;
    public fsbConsumedThisRound = false;
    protected socket: Socket;

    initSocket(socket: Socket) {
        this.socket = socket;
    }

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

    set skipGiftCode(skip: boolean) {
        this._skipGiftCode = skip;
    }
    get skipGiftCode() {
        return this._skipGiftCode;
    }
    set finishPromotion(promotion: FinishPromotion) {
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
        this.receivedPromotionInGame = false;
        this.skipGiftCode = false;
        this.resumedFSBonus = false;
        this.activeTransitionEffect = false;
        this.activeDetailPromo = false;
        this.promotionData = null;
        this.hasServerFinishPromotion = false;
        this.fsbConsumedThisRound = false;
    }

    /** ========== PROMOTION FLOW ========== */
    setPromotionData(rawData: PromotionData, isDirectly = false) {
        this.promotionData = rawData;
        this.receivedPromotionInGame = isDirectly;
    }

    public handlePromotionDisplay() {
        try {
            if (this.activeTransitionEffect || !this.hasPromo()) {
                return;
            }
            if (this.shouldSkipPromo()) {
                return;
            }

            if (this.receivedPromotionInGame) {
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
        return !!this.promotionData?.promotion;
    }

    private shouldSkipPromo(): boolean {
        const dontShow = StorageManager.get(this.storageKey)?.dontShowAgain;
        const isSC1 = configs.systemType.toUpperCase() === "SC1";
        const isGiftCode = this.promotionData?.promotion?.isGiftCode;
        if (dontShow && !isGiftCode) {
            return true;
        }

        return isSC1;
    }

    private handleDirectOpen() {
        const promotion = this.promotionData?.promotion;
        const isGiftCode = promotion?.isGiftCode;
        const isClaimed = promotion?.isClaimed;
        const remaining = promotion?.remainingBonusItems;
        const initial = promotion?.initialBonusItem;

        if (this.skipGiftCode) {
            this.skipGiftCode = false;
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

    public isPromotionInProgress(): boolean {
        return this.currentSpinCount >= 0 && !this.hasServerFinishPromotion && !this.resumedFSBonus;
    }

    public markServerConfirmedEnd() {
        this.hasServerFinishPromotion = true;
        if (!this.fsbConsumedThisRound) {
            this.tryShowEndedPopup();
        }
    }

    public tryShowEndedPopup() {
        if (this.hasServerFinishPromotion) {
            uiManager.emitter.emit(FreeSpinsPromotionEvents.CLOSE_PROMOTION_DETAILS_PANEL);
            uiManager.emitter.emit(FreeSpinsPromotionEvents.OPEN_PROMOTION_ENDED_POPUP, this.finishPromotion);
        }
    }

    tryConsumeFSB() {
        if (this.currentSpinCount > 0 && !this.fsbConsumedThisRound) {
            this.currentSpinCount--;
            this.fsbConsumedThisRound = true;
            uiManager.emitter.emit(FreeSpinsPromotionEvents.UPDATE_FSB_COUNT, this.currentSpinCount);
        }
    }

    revertLastFSB() {
        if (this.fsbConsumedThisRound) {
            this.currentSpinCount++;
            this.fsbConsumedThisRound = false;
            uiManager.emitter.emit(FreeSpinsPromotionEvents.UPDATE_FSB_COUNT, this.currentSpinCount);
        }
    }

    commitFSB() {
        if (this.fsbConsumedThisRound) {
            this.fsbConsumedThisRound = false;
        }
    }

    updateTotalWin(amount: number) {
        if (this.currentSpinCount < 0 || amount <= 0) {
            return;
        }

        uiManager.emitter.emit(FreeSpinsPromotionEvents.UPDATE_TOTAL_WIN, amount);
    }

    shouldSkipUpdateTotalWin() {
        return !this.fsbConsumedThisRound && !this.resumedFSBonus;
    }

    isEligibleForTurnOverPanel(){
        return this.finishPromotion?.totalWin > 0 && this.currentSpinCount === 0;
    }

    claimBonusWin() {
        if (this.socket) {
            this.socket.emit("claim-bonus-win");
        }
    }

    redeemGiftCode(giftCode: string) {
        if (this.socket) {
            this.socket.emit("redeem", { giftCode: giftCode });
        }
    }
}

export const freeSpinsPromotionHandler = FreeSpinsPromotionHandler.getInstance();
