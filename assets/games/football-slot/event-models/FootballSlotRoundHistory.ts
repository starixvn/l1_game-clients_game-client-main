import { FootballSlotResult, FootballSlotSettlementResult } from "../FootballSlotType";

export type FootballSlotRoundHistory = {
    roundId: number;
    result: FootballSlotResult;
    settlementResult: FootballSlotSettlementResult;
};
