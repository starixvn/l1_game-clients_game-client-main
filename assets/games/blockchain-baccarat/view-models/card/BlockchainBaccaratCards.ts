import AudioManager from "../../../../common/audio/AudioManager";
import { CardAnimation } from "../../../../common/new-card/view-models/NewCard";
import { CardModel } from "../../BlockchainBaccaratType";
import BlockchainCard from "../../components/card-list/view-models/BlockchainCard";
import { BlockchainBaccaratEvents, emitEvent } from "../BlockchainBaccaratEvents";

const { ccclass, property } = cc._decorator;

enum OrderCards {
    card1 = 0,
    card2,
    card3
}

type CardFly = {
    card: cc.Node;
    start: cc.Node;
    isCardThree?: boolean;
    isReserve?: boolean;
    isBanker?: boolean;
};

export const playFlyCardAudio = (card: cc.Node, source: cc.AudioClip) => {
    if (AudioManager.getInstance().sfxEnabled) {
        card.runAction(
            cc.sequence(
                cc.delayTime(0.2),
                cc.callFunc(() => AudioManager.getInstance().playSFX(source))
            )
        );
    }
};

@ccclass
export default class BlockchainBaccaratCards extends cc.Component {
    @property(cc.Node)
    cards: cc.Node[] = [];

    @property(cc.Node)
    cardsBox: cc.Node = null;

    @property(cc.Node)
    cardsDrop: cc.Node = null;

    @property(cc.Label)
    point: cc.Label = null;

    @property(cc.Node)
    title: cc.Node = null;

    @property(cc.AudioSource)
    cardAudioSource: cc.AudioSource = null;

    readonly durationFlyCard = 0.6;
    readonly durationFlyCard3 = 0.3;
    readonly durationDropCard = 0.2;
    readonly durationJumpDrop = 0.6;
    readonly durationFlyCard3Banker = 0.4;
    private readonly durationAnimFaceUp = 0.5;
    private readonly durationAwaitAnimFaceUp = 1.3;
    protected readonly setPointSecond = 0.2;
    private clonePositionCards: cc.Vec3[] = [];
    private readonly cardsFlyTween: cc.Tween[] = [];
    private flyCardReserveTween: cc.Tween = null;
    private readonly faceUpCardsTween: cc.Tween[] = [];
    private readonly dropCardsTween: cc.Tween[] = [];
    private readonly cardsRunActionFly: cc.Node[] = [];

    onLoad = () => {
        this.cards.forEach((card, index) => {
            this.clonePositionCards[index] = card.position;
        });
    };

    onDisable() {
        this.resetActions();
    }

    resetActions() {
        this.cardsFlyTween?.forEach((cardTween: cc.Tween) => {
            cardTween.stop();
        });
        this.flyCardReserveTween?.stop();
        this.faceUpCardsTween?.forEach((faceUpTween: cc.Tween) => {
            faceUpTween.stop();
        });
        this.dropCardsTween?.forEach((dropTween) => {
            dropTween.stop();
        });
        this.cardsRunActionFly?.forEach((cardNode: cc.Node) => {
            cardNode.stopAllActions();
        });
    }

    setTagIndex(index: number, card: cc.Node) {
        card.getComponentInChildren(BlockchainCard).setIndexNumber(index);
    }

    resetCards() {
        this.resetPoint();
        this.cards.forEach((card: cc.Node) => {
            this.resetCard(card);
        });
    }

    resetCard(card: cc.Node) {
        const cardNode = card?.getComponentInChildren(BlockchainCard);
        if (cardNode) {
            cardNode.faceDown();
            cardNode.resetHighlight();
            card.opacity = 0;
            card.scale = 0.5;
            card.angle = -135;
            cardNode.animation.clear();
        }
    }

    private resetPoint() {
        if (this.point) {
            this.point.node.parent.active = false;
            this.point.string = "0";
        }
    }

    async flyCard1FromDeck(numberTag: number, delay = this.durationFlyCard) {
        await this.flyCard({ card: this.cards[OrderCards.card1], delay, numberTag });
    }

    async flyCard2FromDeck(numberTag: number, delay = this.durationFlyCard) {
        await this.flyCard({ card: this.cards[OrderCards.card2], delay, numberTag });
    }

    async flyCard3ReserveToPunter(node: cc.Node, start: cc.Node, delay = this.durationFlyCard3, isBanker = false) {
        await this.flyCard({ card: node, delay, numberTag: 0, start, isCardThree: true, isBanker });
    }

    async flyCardFromReserve({
        numberTag,
        card,
        start,
        delay = this.durationFlyCard,
        callBack
    }: {
        numberTag: number;
        card: cc.Node;
        start: cc.Node;
        delay?: number;
        callBack?: () => void;
    }) {
        await this.flyCardReserve(card, delay, numberTag, start, callBack);
    }

    private flyCard({
        card,
        delay,
        numberTag,
        start = this.cardsBox,
        isCardThree = false,
        isBanker
    }: {
        card: cc.Node;
        delay: number;
        numberTag?: number;
        start?: cc.Node;
        isCardThree?: boolean;
        isBanker?: boolean;
    }): Promise<void> {
        return new Promise((resolve) => {
            const cardComponent = card?.getComponentInChildren(BlockchainCard);
            const cardTween = cc
                .tween(card)
                .call(() => {
                    this.setInfoCardFly(cardComponent, numberTag, isCardThree);
                    card &&
                        this.actionCardFly({
                            card,
                            start,
                            isCardThree,
                            isBanker
                        });
                    playFlyCardAudio(card, this.cardAudioSource?.clip);
                })
                .delay(delay)
                .call(() => resolve())
                .start();
            cardTween && this.cardsFlyTween.push(cardTween);
        });
    }

    private flyCardReserve(card: cc.Node, delay: number, numberTag: number, start: cc.Node, callBack: () => void): Promise<void> {
        return new Promise((resolve) => {
            const cardComponent = card?.getComponentInChildren(BlockchainCard);
            this.flyCardReserveTween = cc
                .tween(card)
                .call(() => {
                    callBack();
                    this.setInfoCardFly(cardComponent, numberTag);
                    card &&
                        this.actionCardFly({
                            card,
                            start,
                            isReserve: true
                        });
                    playFlyCardAudio(card, this.cardAudioSource?.clip);
                })
                .delay(delay)
                .call(() => resolve())
                .start();
        });
    }

    setInfoCardFly(cardComponent: BlockchainCard, numberTag: number, isCardThree = false) {
        numberTag > 0 && !isCardThree && cardComponent?.setIndexNumber(numberTag);
        cardComponent?.setStatusInfoTag(true);
        cardComponent?.setStatusIndexNumber(true);
    }

    private actionCardFly({ card, start, isCardThree, isReserve, isBanker }: CardFly) {
        const convertCardBox: cc.Vec3 = cc.v3(card.parent.convertToNodeSpaceAR(start.convertToWorldSpaceAR(cc.v2(0, 0))));
        const cardPosition = card.position;
        card.position = convertCardBox;
        card.opacity = 255;
        if (isReserve) {
            card.scale = 1;
            card.rotation = 0;
            card.runAction(cc.moveTo(this.durationFlyCard, cc.v2(cardPosition.x, cardPosition.y)).easing(cc.easeInOut(2)));
        } else {
            card.runAction(
                cc.spawn(
                    cc.rotateTo(this.durationFlyCard, isCardThree ? (isBanker ? -90 : 90) : 0).easing(cc.easeInOut(2)),
                    cc.scaleTo(this.durationFlyCard, 1).easing(cc.easeInOut(2)),
                    cc.moveTo(this.durationFlyCard, cc.v2(cardPosition.x, cardPosition.y)).easing(cc.easeInOut(2))
                )
            );
        }

        card && this.cardsRunActionFly.push(card);
    }

    dropCards(durationJumpToBoxCard: number, duration: number) {
        this.resetPoint();
        const promises = [];
        this.cards.forEach((cardNode: cc.Node, index) => {
            promises.push(this.actionDropCard(cardNode, index, durationJumpToBoxCard, duration));
        });

        return promises;
    }

    private actionDropCard(cardNode: cc.Node, cardIndex: number, durationJumpToBoxCard: number, duration: number) {
        const worldPosition = this.cardsDrop.convertToWorldSpaceAR(cc.v2(0, 0));
        const destPosition = cardNode.parent.convertToNodeSpaceAR(worldPosition);
        const cardComponent: BlockchainCard = cardNode?.getComponentInChildren(BlockchainCard);
        cardComponent?.setStatusInfoTag(false);
        cardComponent?.resetHighlight();
        return new Promise<void>((resolve) => {
            const dropTween = cc
                .tween(cardNode)
                .to(0.3, { position: cc.v2(0, 0) })
                .call(() => {
                    cardComponent?.playAnimation(CardAnimation.DropCard, 0.4);
                })
                .then(cc.jumpTo(durationJumpToBoxCard, destPosition, 250, 1))
                .call(() => {
                    this.resetCard(cardNode);
                })
                .delay(duration)
                .call(() => {
                    this.setPositionCardsAfterDrop(cardComponent, cardNode, cardIndex);
                    resolve();
                })
                .start();
            dropTween && this.dropCardsTween.push(dropTween);
        });
    }

    private setPositionCardsAfterDrop(cardComponent: cc.Component, cardNode: cc.Node, index: number) {
        cardNode && this.clonePositionCards?.[index] && (cardNode.position = this.clonePositionCards[index]);
        if (cardComponent) {
            cardComponent.node.getChildByName("card").position = cc.v3(0, 0, 0);
            cardComponent.node.getChildByName("card").scale = 0.5;
            cardComponent.node.getChildByName("card").skewX = 0;
            cardComponent.node.getChildByName("card").skewY = 0;
            cardComponent.node.getChildByName("card").opacity = 255;
            cardComponent.node.getChildByName("card").rotation = 0;
        }
    }

    async openCards(card: cc.Node, cardData: CardModel, index: number) {
        await this.faceUpCard(cardData, card);

        emitEvent(BlockchainBaccaratEvents.FLIPPED_CARD, { index: index });

        emitEvent(BlockchainBaccaratEvents.OPENED_CARD, { index: index });
    }

    private faceUpCard(cardInfo: CardModel, card: cc.Node): Promise<void> {
        return new Promise((resolve) => {
            const faceUpTween = cc
                .tween(card)
                .call(() => {
                    const cardComponent = card?.getComponentInChildren(BlockchainCard);
                    cardComponent?.setCardOldStyle({
                        rank: cardInfo.rank.toString(),
                        suit: cardInfo.suit
                    });

                    cardComponent?.playAnimation(CardAnimation.DealerOpenCard, this.durationAnimFaceUp);
                    cardComponent?.animation.on("finished", () => {
                        if (cardComponent.animation.currentClip.name === CardAnimation.DealerOpenCard) {
                            this.handleSetPoint(cardInfo);
                        }
                    });
                })
                .delay(this.durationAwaitAnimFaceUp)
                .call(() => resolve())
                .start();
            faceUpTween && this.faceUpCardsTween.push(faceUpTween);
        });
    }

    private handleSetPoint(data: CardModel) {
        const pointValue: number = +data.rank + 1;
        this.setPoint(pointValue >= 10 ? 0 : pointValue);
    }

    private setPoint(point: number) {
        this.point.node.active = true;
        this.point.node.parent.active = true;

        const currentPoint = parseInt(this.point.string);
        this.point.node.parent.runAction(cc.sequence(cc.scaleTo(this.setPointSecond, 1.1, 1.1), cc.scaleTo(this.setPointSecond, 1, 1)));

        this.point.string = ((currentPoint + point) % 10).toString();
    }

    showCardsWithoutAnimation({
        cards,
        startIndex,
        lastIndex,
        isShowCurrentResult
    }: {
        cards: CardModel[];
        startIndex: number;
        lastIndex?: number;
        isShowCurrentResult?: boolean;
    }) {
        let point = 0;
        cards.forEach((card, index) => {
            const value = +card.rank + 1;
            point += value > 10 || !value ? 0 : value;
            const cardNode = this.cards[index]?.getComponentInChildren(BlockchainCard);
            cardNode?.setCardOldStyle(card);
            if (index === 2 && lastIndex) {
                cardNode?.setIndexNumber(lastIndex);
            } else {
                cardNode?.setIndexNumber(startIndex + index * 2);
            }

            if (isShowCurrentResult) {
                this.cards[index].opacity = 255;
                cardNode?.setStatusIndexNumber(false);
            }
            cardNode?.setFaceUp(true);
        });
        this.point.node.active = true;
        this.point.node.parent.active = true;
        this.point.string = (point % 10).toString();
    }

    showCardsWithoutInfoAndIndex(cards: CardModel[]) {
        cards.forEach((card, index) => {
            const cardNode = this.cards[index]?.getComponent(BlockchainCard);
            cardNode?.setCardOldStyle(card);
            cardNode?.faceUp();
        });
    }
}
