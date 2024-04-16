import { Blockchain } from "./../event-models/BlockchainBaccaratCardListModel";
import { BlockchainBaccaratRoundHistory } from "../event-models/BlockchainBaccaratRoundHistory";
import BlockchainBaccaratCardsShuffle from "./card-shuffle/BlockchainBaccaratCardsShuffle";
import BlockchainBaccaratCards from "./card/BlockchainBaccaratCards";
import GameUtils from "../../../common/GameUtils";
import BlockchainCard from "../components/card-list/view-models/BlockchainCard";

const { ccclass, property } = cc._decorator;

export enum CardsOrder {
    card1 = 0,
    card2,
    card3
}

type OrderCardValue = {
    node: BlockchainBaccaratCards;
    key: number;
};

export enum CountCardFlied {
    FourCards = 4,
    FiveCards,
    SixCards
}

@ccclass
export default class BlockchainBaccaratCardsUI extends cc.Component {
    @property(BlockchainBaccaratCards)
    bankerCards: BlockchainBaccaratCards = null;

    @property(BlockchainBaccaratCards)
    playerCards: BlockchainBaccaratCards = null;

    @property(BlockchainBaccaratCards)
    reserveCards: BlockchainBaccaratCards = null;

    @property(BlockchainBaccaratCardsShuffle)
    burnContainer: BlockchainBaccaratCardsShuffle = null;

    @property(cc.Label)
    winningNotice: cc.Label = null;

    @property(cc.Node)
    cardDropBox: cc.Node = null;

    @property(cc.Node)
    cardDeck: cc.Node = null;

    protected orderCard: OrderCardValue[];
    isRunSettle = false;
    isRunJoinRoom = false;

    onLoad() {
        this.burnContainer && (this.burnContainer.node.active = false);
        this.orderCard = [
            { node: this.playerCards, key: CardsOrder.card1 },
            { node: this.bankerCards, key: CardsOrder.card1 },
            { node: this.playerCards, key: CardsOrder.card2 },
            { node: this.bankerCards, key: CardsOrder.card2 },
            { node: this.reserveCards, key: CardsOrder.card1 },
            { node: this.reserveCards, key: CardsOrder.card2 }
        ];
    }

    handleNumberIndex(currentIndex: number) {
        this.orderCard.forEach((card) => {
            card.node.setTagIndex(currentIndex, card.node.cards[card.key]);
            currentIndex++;
        });
    }

    async handleFlyCards(currentIndex: number, numberCardsFlied: number) {
        switch (numberCardsFlied) {
            case CountCardFlied.FourCards:
                await this.reserveCards.flyCardFromReserve({
                    numberTag: currentIndex,
                    card: this.playerCards.cards[CardsOrder.card1],
                    start: this.reserveCards.cards[CardsOrder.card1],
                    callBack: () => {
                        this.reserveCards.resetCard(this.reserveCards.cards[CardsOrder.card1]);
                    }
                });

                await this.reserveCards.flyCardFromReserve({
                    numberTag: currentIndex + 1,
                    card: this.bankerCards.cards[CardsOrder.card1],
                    start: this.reserveCards.cards[CardsOrder.card2],
                    callBack: () => {
                        this.reserveCards.resetCard(this.reserveCards.cards[CardsOrder.card2]);
                    }
                });
                await this.playerCards.flyCard2FromDeck(currentIndex + 2);
                await this.bankerCards.flyCard2FromDeck(currentIndex + 3);
                await this.reserveCards.flyCard1FromDeck(currentIndex + 4, this.reserveCards.durationFlyCard3);
                await this.reserveCards.flyCard2FromDeck(currentIndex + 5, this.reserveCards.durationFlyCard3);
                break;
            case CountCardFlied.FiveCards:
                await this.reserveCards.flyCardFromReserve({
                    numberTag: currentIndex,
                    card: this.playerCards.cards[CardsOrder.card1],
                    start: this.reserveCards.cards[CardsOrder.card2],
                    callBack: () => {
                        this.reserveCards.resetCard(this.reserveCards.cards[CardsOrder.card2]);
                    }
                });

                await this.bankerCards.flyCard1FromDeck(currentIndex + 1);
                await this.playerCards.flyCard2FromDeck(currentIndex + 2);
                await this.bankerCards.flyCard2FromDeck(currentIndex + 3);
                await this.reserveCards.flyCard1FromDeck(currentIndex + 4, this.reserveCards.durationFlyCard3);
                await this.reserveCards.flyCard2FromDeck(currentIndex + 5, this.reserveCards.durationFlyCard3);
                break;
            default:
                await this.playerCards.flyCard1FromDeck(currentIndex);
                await this.bankerCards.flyCard1FromDeck(currentIndex + 1);
                await this.playerCards.flyCard2FromDeck(currentIndex + 2);
                await this.bankerCards.flyCard2FromDeck(currentIndex + 3);
                await this.reserveCards.flyCard1FromDeck(currentIndex + 4, this.reserveCards.durationFlyCard3);
                await this.reserveCards.flyCard2FromDeck(currentIndex + 5, this.reserveCards.durationFlyCard3);
                break;
        }
    }

    public async collectCardsOnTable(isShuffle = false) {
        if (isShuffle) {
            this.burnContainer?.handleDropCards();
            this.bankerCards?.resetCards();
            this.playerCards?.resetCards();
            this.reserveCards?.resetCards();
        }

        await Promise.all([
            ...this.bankerCards.dropCards(this.bankerCards.durationJumpDrop, this.bankerCards.durationDropCard),
            ...this.playerCards.dropCards(this.bankerCards.durationJumpDrop, this.bankerCards.durationDropCard)
        ]).catch(() => {
            // handle
        });
    }

    async flyCard3(playerHasCard3: boolean, isFlyCard3Player: boolean, delay: number) {
        if (this.reserveCards) {
            if (isFlyCard3Player) {
                this.reserveCards.resetCard(this.reserveCards.cards[CardsOrder.card2]);
            } else {
                this.reserveCards.resetCard(this.reserveCards.cards[CardsOrder.card1]);
            }

            if (playerHasCard3) {
                this.playerCards.cards[CardsOrder.card3]
                    ?.getComponentInChildren(BlockchainCard)
                    ?.setIndexNumber(this.reserveCards.cards[CardsOrder.card1]?.getComponentInChildren(BlockchainCard)?.index);
                await this.reserveCards.flyCard3ReserveToPunter(
                    this.playerCards.cards[CardsOrder.card3],
                    this.reserveCards.cards[CardsOrder.card1],
                    delay,
                    false
                );
            } else {
                const index =
                    this.reserveCards.cards[isFlyCard3Player ? CardsOrder.card2 : CardsOrder.card1].getComponentInChildren(
                        BlockchainCard
                    ).index;
                this.bankerCards.cards[CardsOrder.card3]?.getComponentInChildren(BlockchainCard)?.setIndexNumber(index);
                await this.reserveCards.flyCard3ReserveToPunter(
                    this.bankerCards.cards[CardsOrder.card3],
                    isFlyCard3Player ? this.reserveCards.cards[CardsOrder.card2] : this.reserveCards.cards[CardsOrder.card1],
                    delay,
                    true
                );
            }
        }
    }

    showCardsWithoutAnimation(lastRound: BlockchainBaccaratRoundHistory, currentIndex: number, isShowCurrentResult = false) {
        const playerCards = Object.values(lastRound.result.player).filter((card) => card != null);
        const bankerCards = Object.values(lastRound.result.banker).filter((card) => card != null);
        const startIndex = currentIndex - playerCards.length - bankerCards.length;
        this.playerCards.showCardsWithoutAnimation({ cards: playerCards, startIndex, isShowCurrentResult });
        this.bankerCards.showCardsWithoutAnimation({
            cards: bankerCards,
            startIndex: startIndex + 1,
            lastIndex: currentIndex - 1,
            isShowCurrentResult
        });
        this.resetReserveCards(lastRound);
        playerCards.length + bankerCards.length < 6 && this.updateReserveCardsIndex(startIndex);
    }

    resetReserveCards(lastRound: BlockchainBaccaratRoundHistory) {
        if (lastRound.result.player?.card3 && lastRound.result.banker?.card3) {
            this.reserveCards?.resetCards();
            return;
        }

        if (lastRound.result.player?.card3 || lastRound.result.banker?.card3) {
            this.reserveCards?.resetCard(this.reserveCards.cards[CardsOrder.card1]);
        }
    }

    updateReserveCardsIndex(currentIndex: number) {
        this.reserveCards?.cards.forEach((card: cc.Node, index: number) => {
            const cardComponent: BlockchainCard = card?.getComponentInChildren(BlockchainCard);
            cardComponent?.setIndexNumber(currentIndex + index + 4);
        });
    }

    async handleShuffleCards(data: Blockchain, duration: number, isAnim: boolean, handleGameId: () => void) {
        if (isAnim) {
            await this.collectCardsOnTable(true);
        } else {
            this.bankerCards?.resetCards();
            this.playerCards?.resetCards();
        }

        this.updateCardDropBox(0, 1);
        this.reserveCards?.resetCards();
        this.burnContainer.node.active = true;
        handleGameId();
        this.setActiveCardsUI(false);

        await this.burnContainer.handleShowNewShoe(data, duration);
    }

    setActiveCardsUI(isActive: boolean) {
        if (isActive) {
            GameUtils.showNode(this.reserveCards?.node);
            GameUtils.showNode(this.bankerCards?.node);
            GameUtils.showNode(this.playerCards?.node);
        } else {
            GameUtils.hideNode(this.reserveCards?.node);
            GameUtils.hideNode(this.bankerCards?.node);
            GameUtils.hideNode(this.playerCards?.node);
        }

        this.winningNotice.node.parent.active = false;
    }

    updateCardDropBox(currentIndex: number, cutCardIndex: number) {
        const percent = Math.ceil((currentIndex / cutCardIndex) * 5);
        const cardsNode = this.cardDropBox.getChildByName("cards");
        if (percent > 0) {
            cardsNode.active = true;
            cardsNode.children.forEach((child, index) => {
                child.active = percent - 1 >= index;
            });
        } else {
            cardsNode.active = false;
        }
    }
}
