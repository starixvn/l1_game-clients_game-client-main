import BlockchainCardList from "../components/card-list/view-models/BlockchainCardList";
import BlockchainCardVerification from "../components/card-list/view-models/BlockchainCardVerification";
import { Blockchain } from "../event-models/BlockchainBaccaratCardListModel";

export const highLightCardSelected = (cardList: BlockchainCardList) => (index: number, callback: () => {}) => {
    if (cardList.node.active === false) {
        callback && callback();
    }
    cardList?.highLightCurrentCardSelected(index);
};

export const renderCardVerification = (cardVerification: BlockchainCardVerification, blockchain: Blockchain) => (index: number) => {
    if (cardVerification.node.active === false) {
        return;
    }
    if (cardVerification.numberKey === index || cardVerification.numberKey2 === index) {
        cardVerification.renderDataCardVerification(blockchain?.chain[index], index, true);
    }
};
