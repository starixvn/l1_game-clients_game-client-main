import { BaccaratSettlementResult } from "./../../baccarat/view-models/event-models/BaccaratSettlementResult";
import { CardChainResult } from "./BlockchainBaccaratFinishModel";

export class BlockchainBaccaratRoundHistory {
    roundId: number;
    settlementResult: BaccaratSettlementResult;
    result: CardChainResult;
}
