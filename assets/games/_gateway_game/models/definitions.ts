import EventEmitterBase from "../../../common/emitter/EventEmitterBase";

export const EmitterEvents = {
    RoundHistoryChange: "RoundHistoryChange",
    RtpChange: "RtpChange",
    TotalOnlineChange: "TotalOnlineChange",
    TimeChange: "TimeChange",
    BetLimitChange: "BetLimitChange",
    ActiveNewShoe: "ActiveNewShoe"
};

export const Store = {
    RoundHistory: "RoundHistoryStore",
    GameInfo: "GameInfoStore"
};

export class StoreBase extends EventEmitterBase {
    storeName: string;
}
