import BlockchainCardList from "../components/card-list/view-models/BlockchainCardList";
import { Blockchain, BlockchainBaccaratCardListModel } from "../event-models/BlockchainBaccaratCardListModel";
import { BlockchainBaccaratFinish } from "../event-models/BlockchainBaccaratFinishModel";

export const renderCardSettlement = (cardList: BlockchainCardList) => (finishData: BlockchainBaccaratFinish) => {
    if (cardList.node.active === false) {
        return;
    }
    cardList?.renderCardsSettlement(finishData?.blockchain);
};

export const updateBlockchainCardList = (cardList: BlockchainCardList) => (newBlockchain: Blockchain) => {
    cardList?.updateBlockchain(newBlockchain);
    cardList?.setData();
};

export const updateMainBlockchain = (cardListModel: BlockchainBaccaratCardListModel) => (blockchain: Blockchain, index: number) => {
    cardListModel?.updateMainBlockchain(blockchain?.chain[index], index);
};
