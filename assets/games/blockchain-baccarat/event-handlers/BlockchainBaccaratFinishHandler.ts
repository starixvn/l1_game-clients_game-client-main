import { BaccaratSettlementResult } from "../../baccarat/view-models/event-models/BaccaratSettlementResult";
import { Blockchain } from "../event-models/BlockchainBaccaratCardListModel";
import BlockchainBaccaratGameData from "../event-models/BlockchainBaccaratGameData";
import { BaseEventHandler } from "./../../_new/_base/game-data-management/event-handlers/base-handler";
import { CardChainResult } from "./../event-models/BlockchainBaccaratFinishModel";

export type BlockchainBaccaratFinish = {
    finish: {
        result: CardChainResult;
        settlementResult: BaccaratSettlementResult;
        winningPlayers: any[];
        roundId: number;
        blockchain: Blockchain;
    };
};

export class BlockchainBaccaratFinishHandler extends BaseEventHandler<BlockchainBaccaratFinish> {
    protected readonly gameData: BlockchainBaccaratGameData;

    protected verifyEvent(event: BlockchainBaccaratFinish) {
        return event.finish != null;
    }

    protected handle(event: BlockchainBaccaratFinish) {
        this.gameData.emit(BlockchainBaccaratGameData.Events.SETTLED, event.finish.settlementResult);
        this.gameData.finishModel.changeFinishResult(event.finish);
    }
}
