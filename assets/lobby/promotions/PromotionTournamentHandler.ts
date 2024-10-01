import axios from "axios";
import { buildPromotionSiteUrl } from "../../common/helpers/UrlHelper";
import { sentryLogger } from "../../common/logger";
import EventEmitterBase from "../../common/emitter/EventEmitterBase";
import * as sessionManager from "../../common/auth/SessionManager";
import GameUtils from "../../common/GameUtils";
import { InternalEvents } from "../../managers/InternalEvents";
import { uiManager } from "../../managers/GameUIManager";

export const PromotionTournamentEvents = {
    OPEN_PROMOTION_TOURNAMENT: "OPEN_PROMOTION_TOURNAMENT",
    TOGGLE_ICON: "TOGGLE_ICON"
};

const endpointConstants = {
    existNewOrRunningTournamentPromotion: "exist-new-or-running-promotion-tournament",
    existTournamentPromotionNotification: "exist-promotion-tournament-notification"
}

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

    async checkTournamentPromotionsBeforeSignIn() {
        const emitSignInEvent = () => uiManager.emitter.emit(InternalEvents.HANDLE_ON_SIGN_IN, {});

        try {
            if (sessionManager.getCheckedTournamentPromotionFirstSso()) {
                return emitSignInEvent();
            }

            const existNewOrRunningPromotionTournament = await this.getPromotionData(endpointConstants.existNewOrRunningTournamentPromotion);

            if (existNewOrRunningPromotionTournament) {
                this.emit(PromotionTournamentEvents.OPEN_PROMOTION_TOURNAMENT);
            }
            else {
                sessionManager.setCheckedTournamentPromotionFirstSso(true);
                emitSignInEvent();
            }

        } catch (error) {
            emitSignInEvent();
        }
    }

    async isExistPromotionTournament() {
        return await this.getPromotionData(endpointConstants.existTournamentPromotionNotification);
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
