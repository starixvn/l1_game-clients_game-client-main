import EventEmitterBase from "../../../common/emitter/EventEmitterBase";

export const EmitterEvents = {
    RoundHistoryChange: "RoundHistoryChange",
    RtpChange: "RtpChange",
    TotalOnlineChange: "TotalOnlineChange",
    TimeChange: "TimeChange",
    StartRound: "StartRound",
    LockingBet: "LockingBet",
    PlacingBet: "PlacingBet",
    Settling: "Settling",
    TimeStateChange: "TimeStateChange",

    BetLimitChange: "BetLimitChange",
    ActiveNewShoe: "ActiveNewShoe",
    DisabledGame: "DisabledGame",
    UmMessage: "UmMessage",
    ConnectionFailed: "ConnectionFailed",
    GetLobbyData: "GetLobbyData"
};

export const Store = {
    RoundHistory: "RoundHistoryStore",
    GameInfo: "GameInfoStore",
    DisableGame: "DisableGameStore"
};

export class StoreBase extends EventEmitterBase {
    storeName: string;

    wakeUp() {
        this.updateUI();
    }

    reset() {}
}
