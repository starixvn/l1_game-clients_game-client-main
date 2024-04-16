import { BaseEventHandler } from "../../_new/_base/game-data-management/event-handlers/base-handler";
import BlockchainBaccaratGameData from "../event-models/BlockchainBaccaratGameData";
import { BlockchainBaccaratBetType } from "./../event-models/BlockchainBaccaratBetPercentageModel";

export type BlockchainBaccaratBetPercentage = {
    betPercentage: BlockchainBaccaratBetType;
};

export class BlockchainBaccaratBetPercentageHandler extends BaseEventHandler<BlockchainBaccaratBetPercentage> {
    protected readonly gameData: BlockchainBaccaratGameData;

    protected verifyEvent(event: BlockchainBaccaratBetPercentage) {
        return event.betPercentage != null;
    }

    protected handle(event: BlockchainBaccaratBetPercentage) {
        this.gameData.betPercentage.change(event.betPercentage);
    }
}
