import GameUtils from "../../../../../common/GameUtils";
import CommonDialog from "../../../../../common/_base/view-models/CommonDialog";
import { BlockchainCardModel } from "../../../BlockchainBaccaratType";
import { Blockchain } from "../../../event-models/BlockchainBaccaratCardListModel";
import BlockchainBaccarat from "../../../view-models/BlockchainBaccarat";
import { BlockchainBaccaratEvents, emitEvent } from "../../../view-models/BlockchainBaccaratEvents";
import BlockchainCard from "./BlockchainCard";

const { ccclass, property } = cc._decorator;
@ccclass
export default class BlockchainCardList extends cc.Component {
    @property({ type: cc.Prefab })
    cardPrefab: cc.Prefab = null;

    @property(cc.Node)
    content: cc.Node = null;

    @property(cc.Prefab)
    cardVerificationPrefab: cc.Prefab = null;

    cards: cc.Node[] = [];

    @property(cc.ScrollView)
    statsScrollView: cc.ScrollView = null;

    @property(cc.Node)
    bar: cc.Node = null;

    @property(CommonDialog)
    commonDialog: CommonDialog = null;

    protected cutCard: number;
    protected currentCardIndex: number;
    protected root: BlockchainBaccarat;
    private readonly cardHeight = 123;
    private readonly maxRow = 35;
    private readonly minDisplayIndex = 409;
    private readonly maxDisplayIndex = 420;
    private readonly lineSpacing = 10;
    private readonly calculatedPercent: number[] = [];
    blockchain: Blockchain;
    flippingAnimations: cc.Animation[] = [];
    resultCards: BlockchainCard[] = [];
    cardSelected: number;

    updateBlockchain(blockchain: Blockchain) {
        this.blockchain = blockchain;
    }

    init(root: BlockchainBaccarat) {
        this.root = root;
        this.initCalculatePercent();
        this.commonDialog.addOnWillHide(() => {
            this.removeCards();
            this.root.cardVerification.resetState();
        });

        this.commonDialog.addOnDidHide(() => {
            this.node.active = false;
        });
    }

    protected removeCards() {
        this.content.removeAllChildren();
        this.node.stopAllActions();
    }

    showDialog() {
        if (this.commonDialog) {
            this.commonDialog.showDialog();
        }

        this.bar.setPosition(-3.5, 0);
    }

    public setData() {
        if (!this.blockchain) {
            return;
        }

        const { chain, cutCardIndex, currentIndex } = this.blockchain;
        this.cutCard = cutCardIndex;
        this.currentCardIndex = currentIndex;

        this.cards.forEach((card) => {
            card.removeFromParent();
            card.destroy();
        });

        this.cards = [];
        const cutCardNode = this.createCutCard();
        chain.forEach((card, index) => {
            if (this.cutCard === index) {
                this.content.addChild(cutCardNode);
                this.cards.push(cutCardNode);
            }
            const cardNode = this.createCard(card, index);
            this.content.addChild(cardNode);
            this.cards.push(cardNode);
        });

        this.scrollToCard(currentIndex - 1);
    }

    public scrollToCard(currentIndex: number) {
        const rowIndex = this.calculateDisplayIndex(currentIndex);
        const index = rowIndex >= 2 ? rowIndex - 2 : 0;
        this.statsScrollView.scrollToPercentVertical(1 - this.calculatedPercent[index]);
    }

    public calculateDisplayIndex(currentIndex: number) {
        let rowIndex = 1;
        for (let i = 0, j = 11; i < this.minDisplayIndex && j < this.maxDisplayIndex; ) {
            if (currentIndex >= i && currentIndex <= j) {
                return rowIndex;
            }
            rowIndex++;
            i += 12;
            j += 12;
        }
        return 0;
    }

    initCalculatePercent() {
        const contentHeight = this.maxRow * this.cardHeight + (this.maxRow + 1) * this.lineSpacing;
        const maxOffset = contentHeight - this.statsScrollView.node.height;
        for (let i = 0; i < this.maxRow; i++) {
            let offset = (this.cardHeight + this.lineSpacing) * i;
            if (offset > maxOffset) {
                offset = maxOffset;
            }

            const percent = offset / maxOffset;
            this.calculatedPercent.push(percent);
        }
    }

    public renderCardsSettlement(cardList: Blockchain) {
        if (!this.cards) {
            return;
        }
        this.blockchain = cardList;
        const { chain, currentIndex } = cardList;
        const repeatFlipCard = currentIndex - this.currentCardIndex;
        this.flippingAnimations = [];
        this.resultCards = [];
        chain.forEach((card, index) => {
            if (index >= this.currentCardIndex && index < currentIndex) {
                const newIndex = this.getIndexNumber(index);
                this.updateBlockchainCard(this.cards[newIndex]?.getComponent(BlockchainCard), card, index);
            }
        });
        this.playOpenCardAnimation(repeatFlipCard);
        this.currentCardIndex = currentIndex;
    }

    public playOpenCardAnimation(repeatFlipCard: number) {
        let count = 0;
        cc.tween(this.node)
            .repeat(
                repeatFlipCard,
                cc
                    .tween()
                    .call(() => {
                        this.flippingAnimations[count]?.play();
                        this.resultCards[count]?.setFaceUp(true);
                        count++;
                    })
                    .delay(0.6)
            )
            .start();
    }

    protected updateBlockchainCard(cardComp: BlockchainCard, blockchainCard: BlockchainCardModel, index: number) {
        const { card } = blockchainCard;
        if (!!cardComp) {
            cardComp.setCardOldStyle({
                rank: card?.rank,
                suit: card?.suit
            });

            cardComp.openCardVerification = () => {
                this.initCardVerification(blockchainCard, index);
            };

            this.flippingAnimations.push(cardComp?.animation);
            this.resultCards.push(cardComp);
            emitEvent(BlockchainBaccaratEvents.FLIPPED_CARD, { index: index });
        }
    }

    public createCard(cardChain: BlockchainCardModel, index: number): cc.Node {
        const { card } = cardChain;
        const node = GameUtils.createNodeFromPrefab(this.cardPrefab);
        const cardComponent = node.getComponent(BlockchainCard);
        cardComponent.setCardOldStyle({
            rank: card?.rank,
            suit: card?.suit
        });

        !!card ? cardComponent.setFaceUp(true) : cardComponent.setFaceUp(false);

        cardComponent.openCardVerification = () => {
            this.initCardVerification(cardChain, index);
        };

        cardComponent.setIndexNumber(index);

        return node;
    }

    private createCutCard(): cc.Node {
        const node = GameUtils.createNodeFromPrefab(this.cardPrefab);
        const cardComponent = node.getComponent(BlockchainCard);
        cardComponent.setKeyCard();
        cardComponent.openCardVerification = () => {};
        return node;
    }

    public initCardVerification(blockchainCard: BlockchainCardModel, index: number) {
        const cardVerification = this.root.node.getChildByName(this.cardVerificationPrefab.name);
        if (cardVerification) {
            cardVerification.removeFromParent(true);
            cardVerification.destroy();
        }

        this.root.cardVerification.renderDataCardVerification(blockchainCard, index);
        this.root.cardVerification.node.active = true;
        this.root.cardVerification.showDialog();
    }

    public highLightCurrentCardSelected(index: number) {
        const newIndex = this.getIndexNumber(index);
        this.resetHighLightCurrentCardSelected();
        this.cards[newIndex].getComponent(BlockchainCard).highLightCard();
        this.scrollToCard(newIndex);
        this.cardSelected = newIndex;
    }

    public resetHighLightCurrentCardSelected() {
        this.cards[this.cardSelected]?.getComponent(BlockchainCard).resetHighLightCard();
    }

    private getIndexNumber(index: number) {
        return index >= this.cutCard ? index + 1 : index;
    }
}
