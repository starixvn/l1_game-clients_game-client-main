import { EmitterEvents, Store, StoreBase } from "./definitions";

export interface RoundHistory {
    result: any;
    settlementResult: any;
    roundId: number;
}

export class GameInfoStore extends StoreBase {
    storeName = Store.GameInfo;
    totalOnlineUsers = 0;
    rtp = 0;
    remainingTime = 0;

    betLimit: { minBet: number; maxBet: number } = null;

    changeOnlineUsers(totalOnlineUsers: number) {
        this.totalOnlineUsers = totalOnlineUsers;
        this.emit(EmitterEvents.TotalOnlineChange, this.totalOnlineUsers);
    }

    changeRtp(rtp: number) {
        this.rtp = rtp;
        this.emit(EmitterEvents.RtpChange, this.rtp);
    }

    changeTime(time: number) {
        this.remainingTime = time;
        this.emit(EmitterEvents.TimeChange, this.remainingTime);
    }

    changeBetLimit(betLimit: { minBet: number; maxBet: number }) {
        this.betLimit = betLimit;
        this.emit(EmitterEvents.BetLimitChange, this.betLimit);
    }

    updateUI() {
        this.emit(EmitterEvents.RtpChange, this.rtp);
        this.emit(EmitterEvents.TotalOnlineChange, this.totalOnlineUsers);
        this.emit(EmitterEvents.TimeChange, this.remainingTime);
        this.emit(EmitterEvents.BetLimitChange, this.betLimit);
    }
}
