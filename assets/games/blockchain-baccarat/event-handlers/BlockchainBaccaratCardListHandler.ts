import { BaseEventHandler } from "../../_new/_base/game-data-management/event-handlers/base-handler";
import { BlockchainCardModel } from "../BlockchainBaccaratType";
import { Blockchain } from "../event-models/BlockchainBaccaratCardListModel";
import BlockchainBaccaratGameData from "../event-models/BlockchainBaccaratGameData";

export type BlockchainBaccaratCardListType = {
    blockchain: {
        burnedCards: number;
        currentIndex: number;
        cutCardIndex: number;
        chain: BlockchainCardModel[];
        isNew: boolean;
    };
};

export class BlockchainBaccaratCardListHandler extends BaseEventHandler<BlockchainBaccaratCardListType> {
    protected readonly gameData: BlockchainBaccaratGameData;

    protected verifyEvent(event: BlockchainBaccaratCardListType) {
        return event.blockchain != null;
    }

    protected handle(event: BlockchainBaccaratCardListType) {
        this.gameData.cardList.change(event.blockchain as Blockchain);
        this.gameData.cardList.changeCurrentIndexJoinRoom(event.blockchain.currentIndex);
    }
}
