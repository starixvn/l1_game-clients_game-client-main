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

    async isExistPromotionTournament() {
        try {
            const queryString = this.getQueryString();
            const url = `${buildPromotionSiteUrl()}/notification/exist-promotion-tournament?${queryString}`;
            const response = await axios.get(url);
            if (response.data?.data) {
                return true;
            }
        } catch (error) {
            sentryLogger.log(`Get promotion tournament failed: ${error.message}`);
        }
        return false;
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

    private getQueryString() {
        const session = sessionManager.getSession();
        const params = {
            sessionId: GameUtils.base64Encode(session?.ss || ""),
            username: session?.username,
            language: session?.language
        };
        const searchParams = new URLSearchParams();
        Object.keys(params).forEach((key) => params[key] !== undefined && searchParams.append(key, params[key]));
        return searchParams.toString();
    }
}

export const promotionTournamentHandler = PromotionTournamentHandler.getInstance();
