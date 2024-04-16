import { BaccaratSettlementResult } from "./../../baccarat/view-models/event-models/BaccaratSettlementResult";
import { CardsOrder } from "./../view-models/BlockchainBaccaratCardsUI";
import { BlockchainBaccaratFinish, CardChainResult } from "./../event-models/BlockchainBaccaratFinishModel";
import BlockchainBaccaratCardsUI from "../view-models/BlockchainBaccaratCardsUI";
import BlockchainCard from "../components/card-list/view-models/BlockchainCard";
import { Blockchain } from "../event-models/BlockchainBaccaratCardListModel";

export const openCards = (cardsUI: BlockchainBaccaratCardsUI) => async (dataFinish: BlockchainBaccaratFinish, callback: () => void) => {
    const result = dataFinish.result;
    const blockchain = dataFinish.blockchain;
    const cardsIndex = calculateCardIndex(result, blockchain);
    let isFlyCard3Player = false;

    await cardsUI.playerCards.openCards(cardsUI.playerCards.cards[CardsOrder.card1], result.player.card1, cardsIndex[0]);
    await cardsUI.playerCards.openCards(cardsUI.playerCards.cards[CardsOrder.card2], result.player.card2, cardsIndex[1]);
    await cardsUI.bankerCards.openCards(cardsUI.bankerCards.cards[CardsOrder.card1], result.banker.card1, cardsIndex[2]);
    await cardsUI.bankerCards.openCards(cardsUI.bankerCards.cards[CardsOrder.card2], result.banker.card2, cardsIndex[3]);

    if (result?.player?.card3) {
        isFlyCard3Player = true;
        await cardsUI.flyCard3(true, false, cardsUI.playerCards.durationFlyCard);
        await cardsUI.playerCards.openCards(cardsUI.playerCards.cards[CardsOrder.card3], result.player.card3, cardsIndex[4]);
    }

    if (result?.banker?.card3) {
        await cardsUI.flyCard3(false, isFlyCard3Player, cardsUI.bankerCards.durationFlyCard3Banker);
        await cardsUI.bankerCards.openCards(cardsUI.bankerCards.cards[CardsOrder.card3], result.banker.card3, cardsIndex[5]);
    }

    callback();
    showHighlightCards(cardsUI, dataFinish.settlementResult);
};

export const showHighlightCards = (cardsUI: BlockchainBaccaratCardsUI, settlementResult: BaccaratSettlementResult) => {
    let cards: cc.Node[] = [];
    if (settlementResult.banker) {
        cards = cardsUI.bankerCards.cards;
    } else if (settlementResult.player) {
        cards = cardsUI.playerCards.cards;
    }

    cards.forEach((card: cc.Node) => {
        card.getComponentInChildren(BlockchainCard).setHighlight();
    });
};

export const calculateCardIndex = (result: CardChainResult, blockchain: Blockchain) => {
    const playerCards = Object.values(result.player).filter((card) => card != null);
    const bankerCards = Object.values(result.banker).filter((card) => card != null);
    const startIndex = blockchain.currentIndex - playerCards.length - bankerCards.length;
    const cardsIndex = [];
    cardsIndex.push(startIndex);
    cardsIndex.push(startIndex + 1);
    cardsIndex.push(startIndex + 2);
    cardsIndex.push(startIndex + 3);
    cardsIndex.push(startIndex + 4);
    cardsIndex.push(startIndex + playerCards.length + bankerCards.length - 1);

    return cardsIndex;
};
