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

    newShoePhase = false;

    betLimit: { minBet: number; maxBet: number } = null;

    timer: any;

    changeOnlineUsers(totalOnlineUsers: number) {
        this.totalOnlineUsers = totalOnlineUsers;
        this.emit(EmitterEvents.TotalOnlineChange, this.totalOnlineUsers);
    }

    setNewShoe(active: boolean) {
        this.newShoePhase = active;
        this.emit(EmitterEvents.ActiveNewShoe, this.newShoePhase);
    }

    increaseOnlineUser() {
        this.changeOnlineUsers(this.totalOnlineUsers + 1);
    }

    decreaseOnlineUser() {
        const value = Math.max(this.totalOnlineUsers - 1, 0);
        this.changeOnlineUsers(value);
    }

    changeRtp(rtp: number) {
        if (!rtp) {
            return;
        }
        this.rtp = rtp;
        this.emit(EmitterEvents.RtpChange, this.rtp);
    }

    receiveTimeRemaining(time: number) {
        this.changeTime(time);
        this.activeTimer();
    }

    changeTime(time: number) {
        this.remainingTime = time;
        this.emit(EmitterEvents.TimeChange, this.remainingTime);
    }

    activeTimer() {
        this.timer = setInterval(() => {
            const value = this.remainingTime - 1;
            if (value >= 0) {
                this.changeTime(value);
            }

            if (value <= 0) {
                this.clearTimer();
            }
        }, 1000);
    }

    clearTimer() {
        this.timer && clearInterval(this.timer);
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
