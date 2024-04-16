import { BaseEventHandler } from "../../_new/_base/game-data-management/event-handlers/base-handler";
import BlockchainBaccaratGameData from "../event-models/BlockchainBaccaratGameData";
import { BlockchainBaccaratRoundHistory } from "../event-models/BlockchainBaccaratRoundHistory";

export type BlockchainBaccaratRoundHistoryType = {
    roundHistory: BlockchainBaccaratRoundHistory[];
};

export class BlockchainBaccaratRoundHistoryHandler extends BaseEventHandler<BlockchainBaccaratRoundHistoryType> {
    protected readonly gameData: BlockchainBaccaratGameData;

    protected verifyEvent(event: BlockchainBaccaratRoundHistoryType) {
        return event.roundHistory && event.roundHistory.length !== 0;
    }

    protected handle(event: BlockchainBaccaratRoundHistoryType) {
        this.gameData.roundHistory.cleanWithoutTriggerEvent();
        this.gameData.roundHistory.push(...event.roundHistory);
    }
}
