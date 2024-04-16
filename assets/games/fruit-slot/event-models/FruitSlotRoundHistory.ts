import { FruitSlotResult, FruitSlotSettlementResult } from "../FruitSlotType";

export type FruitSlotRoundHistory = {
    roundId: number;
    result: FruitSlotResult;
    settlementResult: FruitSlotSettlementResult;
};
