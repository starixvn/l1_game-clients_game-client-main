import { History } from "../../_new/_base/game-data-management/models/history";
import { BlockchainBaccaratRoundHistory } from "./BlockchainBaccaratRoundHistory";

export class BlockchainBaccaratRoundHistoryModel extends History<BlockchainBaccaratRoundHistory> {
    static RoundHistoryEvents = {
        CHANGE: "RoundHistory:change"
    };

    protected dispatchChangeEvent() {
        super.dispatchChangeEvent();
        this.emit(BlockchainBaccaratRoundHistoryModel.RoundHistoryEvents.CHANGE, this);
    }

    fifo(model: BlockchainBaccaratRoundHistory) {
        if (this.data && this.data.length && this.data[0].roundId === model.roundId) {
            return;
        }

        super.fifo(model);
    }
}
