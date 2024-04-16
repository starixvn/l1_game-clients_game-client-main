import { i18n } from "../../../ClientModules";
import AudioManager from "../../../common/audio/AudioManager";
import { getNameCard } from "../../../common/helpers/CardHelper";
import NewCard, { CardAnimation } from "../../../common/new-card/view-models/NewCard";
import BaccaratCard from "../../baccarat/view-models/BaccaratCard";
import { StringHelper } from "./WinThreeCardsHelper";
import { HandRanks } from "./WinThreeCardsConstant";
import { WinThreeCardsResult } from "./WinThreeCardsModel";

const { ccclass, property } = cc._decorator;

export const AnimationTime = {
    flyCard: 0.5,
    openCard: 0.5
};

@ccclass
export default class WinThreeCardsItem extends cc.Component {
    @property(cc.Node)
    card1: cc.Node = null;

    @property(cc.Node)
    card2: cc.Node = null;

    @property(cc.Node)
    card3: cc.Node = null;

    @property(cc.Sprite)
    cardBack: cc.Sprite = null;

    @property()
    flyX = 0;

    @property
    isDragon = false;

    @property(cc.Node)
    cardsBox: cc.Node = null;

    @property(cc.Label)
    numberTagCardBack: cc.Label = null;

    @property(cc.Node)
    rank: cc.Node = null;

    @property(cc.Label)
    handRank: cc.Label = null;

    @property(cc.Label)
    cardRank: cc.Label = null;

    @property(cc.Node)
    cardDropPlace: cc.Node = null;

    protected playGetCardAudio = () => {
        // handle
    };

    protected isMainPage = false;

    private readonly SHOW_CARD = 1;
    private clonePositionCards: cc.Vec3[] = [];
    private cardsNodes: cc.Node[] = [];
    public cardResult: WinThreeCardsResult = null;

    onLoad() {
        this.cardsNodes = [this.card1, this.card2, this.card3];
        this.cardsNodes.forEach((cardNode: cc.Node, index: number) => {
            cardNode.getComponentInChildren(NewCard).faceDown();
            this.clonePositionCards[index] = cardNode.position;
        });
    }

    onDisable() {
        this.cardsNodes.forEach((cardTween: cc.Node) => {
            cardTween.stopAllActions();
        });
    }

    init(playAudio, isMainPage = true) {
        if (playAudio) {
            this.playGetCardAudio = playAudio;
        }

        this.isMainPage = isMainPage;
    }

    showHighlightCards(highlight = true) {
        for (let i = 1; i <= 3; i++) {
            const card = this[`card${i}`];
            const baccaratCard = card.getComponent(BaccaratCard);
            highlight ? baccaratCard.setHighlight() : baccaratCard.resetHighlight();
        }
    }

    showCardsWithoutAnimation() {
        this.resetSomeActionCards();
        for (let i = 0; i < 3; i++) {
            this.openCard(i, false);
        }

        this.setRank();
    }

    showFirstTwoCards() {
        for (let i = 0; i < 2; i++) {
            this.openCard(i, true);
        }
    }

    showLastCard() {
        this.openCard(2);
    }

    setRank() {
        const { cardRankId, handRankId } = this.cardResult;
        this.handRank.node.active = true;
        this.handRank.string = i18n.t(`${StringHelper.winThreeCardsNameSpace}.${HandRanks[handRankId]}`);

        if (handRankId <= HandRanks.onePair && cardRankId >= 0) {
            this.cardRank.node.active = true;
            this.cardRank.string = getNameCard(cardRankId);
        }

        this.rank.active = true;
    }

    hideRank() {
        this.rank.active = false;
        this.cardRank.node.active = false;
    }

    protected resetSomeActionCards() {
        this.node.stopActionByTag(this.SHOW_CARD);
    }

    public flyCard(cardNumber: number, scale = 1) {
        const card = this.cardsNodes[cardNumber];
        const boxWorldPosition = this.cardsBox.convertToWorldSpaceAR(cc.v2(0, 0));
        const boxPosition = card.parent.convertToNodeSpaceAR(boxWorldPosition);

        if (card && card.isValid) {
            const cardPosition = card.position;
            card.position = cc.v3(boxPosition.x, boxPosition.y);
            card.opacity = 255;
            card.scale = 0.4;
            card?.getComponent(BaccaratCard) && (card.getComponent(BaccaratCard).numberTag.parent.active = true);

            card.runAction(
                cc.spawn(
                    cc.rotateTo(AnimationTime.flyCard, 0).easing(cc.easeInOut(2)),
                    cc.scaleTo(AnimationTime.flyCard, scale).easing(cc.easeInOut(2)),
                    cc.moveTo(AnimationTime.flyCard, cc.v2(cardPosition.x, cardPosition.y)).easing(cc.easeInOut(2))
                )
            );

            if (AudioManager.getInstance().sfxEnabled) {
                card.runAction(
                    cc.sequence(
                        cc.delayTime(0.2),
                        cc.callFunc(() => this.playGetCardAudio())
                    )
                );
            }
        }
    }

    private resetCard(card: cc.Node) {
        const cardNode = card.getComponentInChildren(NewCard);
        cardNode.faceDown();
        card.opacity = 0;
        card.scale = 1;
        card.angle = -135;
    }

    private openCard(index: number, isAnimated = true) {
        const { cards } = this.cardResult;

        if (index < cards.length) {
            const cardData = cards[index];
            const currentCard = this[`card${index + 1}`] as cc.Node;

            currentCard.active = false;
            if (cardData) {
                currentCard.active = true;
            }
            currentCard?.getComponent(BaccaratCard) && (currentCard.getComponent(BaccaratCard).numberTag.parent.active = false);

            const newCard = currentCard.children[0].getComponent(NewCard);
            newCard.setCardOldStyle({
                rank: cardData.rank,
                suit: cardData.suit
            });

            newCard.faceUp();
            this.handleCardWithAnimated(isAnimated, currentCard, 0);
        }
    }

    private handleCardWithAnimated(isAnimated: boolean, currentCard: cc.Node, delayTime: number): number {
        if (isAnimated) {
            delayTime = this.calculateDelayAnimationTime(currentCard, delayTime);
        } else {
            if (this.isMainPage) {
                currentCard.getComponent(BaccaratCard).numberTag.active = false;
            }
        }

        return delayTime;
    }

    private calculateDelayAnimationTime(currentCard: cc.Node, delayTime: number) {
        this.calculateTwoFirstCardDelayAnimationTime(currentCard);
        delayTime += AnimationTime.openCard;
        return delayTime;
    }

    private calculateTwoFirstCardDelayAnimationTime(currentCard: cc.Node) {
        currentCard.scaleX = 0;
        currentCard.runAction(cc.scaleTo(AnimationTime.openCard, 1, 1));
        this.card1.getComponent(BaccaratCard).numberTag.active = false;
    }

    dropCards(durationJumpToBoxCard = 0.6, duration = 0.2) {
        this.hideRank();
        const promises = [];
        this.cardsNodes.forEach((cardNode: cc.Node, index) => {
            promises.push(this.actionDropCard(cardNode, index, durationJumpToBoxCard, duration, this.cardDropPlace));
        });

        return promises;
    }

    private actionDropCard(cardNode: cc.Node, cardIndex: number, durationJumpToBoxCard: number, duration: number, cardDropPlace: cc.Node) {
        return new Promise<void>((resolve) => {
            const worldPosition = cardDropPlace.convertToWorldSpaceAR(cc.v2(0, 0));
            const cardComponent = cardNode.getComponentInChildren(NewCard);
            const destPosition = cardNode.parent.convertToNodeSpaceAR(worldPosition);
            const baccaratCardComponent = cardNode.getComponent(BaccaratCard);
            baccaratCardComponent.numberTag.active = true;
            baccaratCardComponent.resetHighlight();

            cc.tween(cardNode)
                .to(0.3, { position: cc.v2(0, 0) })
                .call(() => cardComponent.playAnimation(CardAnimation.DropCard, 0.5))
                .then(cc.jumpTo(durationJumpToBoxCard, destPosition, 100, 1))
                .call(() => this.resetCard(cardNode))
                .delay(duration)
                .call(() => {
                    this.setPositionCardsAfterDrop(cardComponent, cardNode, cardIndex);
                    resolve();
                })
                .start();
        });
    }

    private setPositionCardsAfterDrop(cardComponent: cc.Component, cardNode: cc.Node, index: number) {
        cardNode.position = this.clonePositionCards[index];
        const card = cardComponent.node.getChildByName("card");
        card.position = cc.v3(0, 0, 0);
        card.scale = 0.5;
        card.skewX = 0;
        card.skewY = 0;
        card.opacity = 255;
        card.rotation = 0;
    }
}
