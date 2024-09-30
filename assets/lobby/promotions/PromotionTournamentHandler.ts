import axios from "axios";
import { buildPromotionSiteUrl } from "../../common/helpers/UrlHelper";
import { sentryLogger } from "../../common/logger";
import EventEmitterBase from "../../common/emitter/EventEmitterBase";
import * as sessionManager from "../../common/auth/SessionManager";
import GameUtils from "../../common/GameUtils";

export const PromotionTournamentEvents = {
    OPEN_PROMOTION_TOURNAMENT: "OPEN_PROMOTION_TOURNAMENT",
    TOGGLE_ICON: "TOGGLE_ICON"
};

export default class PromotionTournamentHandler extends EventEmitterBase {
    private static instance: PromotionTournamentHandler;
    private intervalId: NodeJS.Timer = null;
    private intervalTime = 1000 * 60 * 10;

    public static getInstance(): PromotionTournamentHandler {
        if (!this.instance) {
            this.instance = new PromotionTournamentHandler();
        }

        return this.instance;
    }

    init() {
        if (!this.intervalId) {
            this.intervalId = setInterval(() => {
                this.checkExistPromotion();
            }, this.intervalTime);
            this.checkExistPromotion();
        }
    }

    async checkExistPromotion() {
        const isExist = await this.isExistPromotionTournament();
        this.toggleIcon(isExist);
    }

    async openTournamentPopup() {
        if (!sessionManager.getOpenTournamentPopup()) {
            const existPromotionTournamentNotification = await this.getPromotionData("exist-new-or-running-promotion-tournament");
            if (existPromotionTournamentNotification) {
                this.emit(PromotionTournamentEvents.OPEN_PROMOTION_TOURNAMENT);
                sessionManager.setOpenTournamentPopup();
            }
        }
    }

    async isExistPromotionTournament() {
        const result = await this.getPromotionData("exist-promotion-tournament-notification");
        return result;
    }

    toggleIcon(isActive: boolean) {
        this.emit(PromotionTournamentEvents.TOGGLE_ICON, isActive);
    }

    getListPromotionUrl() {
        const queryString = this.getQueryString();
        const url = `${buildPromotionSiteUrl()}/?${queryString}`;

        return `${url}`;
    }

    clear() {
        this.intervalId && clearInterval(this.intervalId);
        this.intervalId = null;
    }

    private async getPromotionData(action: string) {
        try {
            const queryString = this.getQueryString();
            const url = `${buildPromotionSiteUrl()}/notification/${action}?${queryString}`;
            const response = await axios.get(url);

            return response.data;
        } catch (error) {
            sentryLogger.log(`Get promotion tournament failed: ${error.message}`);
            return false;
        }
    }

    private buildParams() {
        const session = sessionManager.getSession();
        return {
            sessionId: GameUtils.base64Encode(session?.ss || ""),
            username: session?.username,
            language: session?.language
        };
    }
    private getQueryString() {
        const searchParams = new URLSearchParams();
        const params = this.buildParams();
        Object.keys(params).forEach((key) => params[key] !== undefined && searchParams.append(key, params[key]));
        return searchParams.toString();
    }
}

export const promotionTournamentHandler = PromotionTournamentHandler.getInstance();
