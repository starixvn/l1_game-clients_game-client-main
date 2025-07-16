import NotificationService from "../../common/auth/NotificationService";
import EventEmitterBase from "../../common/emitter/EventEmitterBase";
import { uiManager } from "../../managers/GameUIManager";

interface ITurnOverRequired {
    win: number;
    totalTO: number;
    minTO: number;
    expire: string;
    progress: number;
}

export const TurnOverRequiredEvents = {
    OPEN_TURN_OVER_REQUIRED: "OPEN_TURN_OVER_REQUIRED",
    UPDATE_TURN_OVER_REQUIRED: "UPDATE_TURN_OVER_REQUIRED",
    OPEN_CLAIM_BONUS_NOTIFICATION: "OPEN_CLAIM_BONUS_NOTIFICATION",
    UPDATE_BALANCE_BONUS: "UPDATE_BALANCE_BONUS"
};

export const TurnOverRequiredDataKey = {
    PROMOTION_TO_PROGRESS: "promotionProgress"
};

export default class TurnOverRequiredHandler extends EventEmitterBase{
    private static instance: TurnOverRequiredHandler;
    public events = {};
    private promotionTOProgress: any = null;
    private readonly turnOverRequiredDataKey = [
        TurnOverRequiredDataKey.PROMOTION_TO_PROGRESS
    ];

    public static getInstance(): TurnOverRequiredHandler {
        if (!this.instance) {
            this.instance = new TurnOverRequiredHandler();
        }

        return this.instance;
    }

    setPromotionTOProgress(promotionTOProgress: any) {
        this.promotionTOProgress = promotionTOProgress;
    }

    getPromotionTOProgress() {
        return this.promotionTOProgress;
    }

    emitEvent(eventName: string, data: any) {
        NotificationService.getInstance().emitEvent(eventName, data);
    }

    initEvents() {
        this.clearObservers();

        this.turnOverRequiredDataKey.forEach((key) => {
            this.addDataObserver(key, key);
        });
    }

    clearObservers() {
        this.turnOverRequiredDataKey.forEach((key) => {
            this.removeDataObserver(key, key);
        });
    }

    addDataObserver(dataType: string, dataKey: string) {
        console.log("addDataObserver", dataType, dataKey);
        let callback;
        if (dataType === TurnOverRequiredDataKey.PROMOTION_TO_PROGRESS) {
            callback = (data: ITurnOverRequired) => this.onReceivedPromotionTOProgressData(data);
        }
        NotificationService.getInstance().addDataObserver(dataType, dataKey, callback);
    }

    onReceivedPromotionTOProgressData(data: any) {
        this.setPromotionTOProgress(data);
        uiManager.emitter.emit(TurnOverRequiredEvents.UPDATE_TURN_OVER_REQUIRED, data);
    }

    removeDataObserver(dataType: string, dataKey: string) {
        NotificationService.getInstance().removeDataObserver(dataType, dataKey);
    }

    displayTurnOverRequired() {
        const promotionTOProgress = this.getPromotionTOProgress();
        if (promotionTOProgress) {
            uiManager.emitter.emit(TurnOverRequiredEvents.OPEN_TURN_OVER_REQUIRED, promotionTOProgress);
        }
    }
}

export const turnOverRequiredHandler = TurnOverRequiredHandler.getInstance();
