import { Store } from "../models/definitions";
import { GameInfoStore } from "../models/game-info-store";
import { BaseEventHandler } from "./base-event-handler";
interface GameInfoType {
    totalOnlineUsers?: number;
    remainingTime?: number;
    rtp?: number;
    betLimit?: { minBet: number; maxBet: number };
}
export class GameInfoHandler extends BaseEventHandler<any> {
    protected verifyEvent(event: GameInfoType): boolean {
        return (
            event.totalOnlineUsers !== undefined ||
            event.remainingTime !== undefined ||
            event.rtp !== undefined ||
            event.betLimit !== undefined
        );
    }

    protected handle(data: GameInfoType) {
        const store = this.gameData.getStore(Store.GameInfo) as GameInfoStore;

        if (data.totalOnlineUsers !== undefined) {
            store.changeOnlineUsers(data.totalOnlineUsers);
        }
        if (data.remainingTime !== undefined) {
            store.changeTime(data.remainingTime);
        }
        if (data.rtp !== undefined) {
            store.changeRtp(data.rtp);
        }
        if (data.betLimit !== undefined) {
            store.changeBetLimit(data.betLimit);
        }
    }
}
