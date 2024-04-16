import { Blockchain } from "./BlockchainBaccaratCardListModel";
import EventEmitterBase from "../../../common/emitter/EventEmitterBase";
import { ResultCards } from "../BlockchainBaccaratType";
import { BaccaratSettlementResult } from "../../baccarat/view-models/event-models/BaccaratSettlementResult";

export type CardChainResult = {
    player: ResultCards;
    banker: ResultCards;
};

export type BlockchainBaccaratFinish = {
    result: CardChainResult;
    settlementResult: BaccaratSettlementResult;
    winningPlayers: any[];
    roundId: number;
    blockchain: Blockchain;
};

export class BlockchainBaccaratFinishModel extends EventEmitterBase {
    static Events = {
        CHANGE_SETTLEMENT: "settlement:change",
        SHOWED_ANIMATION: "animation:showed"
    };

    finishData: BlockchainBaccaratFinish;

    changeFinishResult(finish: BlockchainBaccaratFinish) {
        this.finishData = finish;
        this.emit(BlockchainBaccaratFinishModel.Events.CHANGE_SETTLEMENT, finish);
    }

    finishAnimationWinning() {
        this.emit(BlockchainBaccaratFinishModel.Events.SHOWED_ANIMATION, this);
    }

    clear() {
        this.finishData = null;
    }
}
