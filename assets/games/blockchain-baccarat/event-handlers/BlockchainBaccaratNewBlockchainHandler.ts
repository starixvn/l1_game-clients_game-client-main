import { BaseEventHandler } from "../../_new/_base/game-data-management/event-handlers/base-handler";
import { Blockchain } from "../event-models/BlockchainBaccaratCardListModel";
import BlockchainBaccaratGameData from "../event-models/BlockchainBaccaratGameData";

export type BlockchainBaccaratNewBlockchainType = {
    newBlockchain: Blockchain;
};

export class BlockchainBaccaratNewBlockchainHandler extends BaseEventHandler<BlockchainBaccaratNewBlockchainType> {
    protected readonly gameData: BlockchainBaccaratGameData;

    protected verifyEvent(event: BlockchainBaccaratNewBlockchainType) {
        return event.newBlockchain != null;
    }

    protected handle(event: BlockchainBaccaratNewBlockchainType) {
        this.gameData.cardList.updateNewBlockchain(event.newBlockchain);
        this.gameData.cardList.change(event.newBlockchain);
        this.gameData.roundHistory.cleanWithoutTriggerEvent();
    }
}
