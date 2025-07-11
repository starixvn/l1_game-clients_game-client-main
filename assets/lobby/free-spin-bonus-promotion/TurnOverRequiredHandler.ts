import NotificationService from "../../common/auth/NotificationService";
import EventEmitterBase from "../../common/emitter/EventEmitterBase";
import { uiManager } from "../../managers/GameUIManager";

interface ITurnOverRequired {
    totalWinAmount: number;
    totalTurnover: number;
    minRequiredTurnover: number;
    turnoverMultiplier: number;
}

export const TurnOverRequiredEvents = {
    OPEN_TURN_OVER_REQUIRED: "OPEN_TURN_OVER_REQUIRED"
};


export default class TurnOverRequiredHandler extends EventEmitterBase{
    private static instance: TurnOverRequiredHandler;
    public events = {};
    private promotionTOProgress: any = null;
    private readonly turnOverRequiredDataKey = [
       
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

        NotificationService.getInstance().addDataObserver(dataType, dataKey, callback);
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
