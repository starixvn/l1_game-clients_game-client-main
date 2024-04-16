import { playFlyCardAudio } from "./../card/BlockchainBaccaratCards";
import { BlockchainCardModel } from "./../../BlockchainBaccaratType";
import { Blockchain } from "./../../event-models/BlockchainBaccaratCardListModel";
import { CardAnimation } from "./../../../../common/new-card/view-models/NewCard";
import { CardModel } from "../../BlockchainBaccaratType";
import BlockchainCard from "../../components/card-list/view-models/BlockchainCard";

const { ccclass, property } = cc._decorator;

export enum TimeShowAnim {
    full = 42,
    burnCard = 38
}

@ccclass
export default class BlockchainBaccaratCardsShuffle extends cc.Component {
    @property(cc.Prefab)
    cardPrefab: cc.Prefab = null;

    @property(cc.Node)
    cutCard: cc.Node = null;

    @property(cc.Node)
    burnCard: cc.Node = null;

    @property(cc.Node)
    containerBurnCards: cc.Node = null;

    @property(cc.Node)
    centerCard: cc.Node = null;

    @property(cc.Node)
    cardsBox: cc.Node = null;

    @property(cc.Node)
    cardsDrop: cc.Node = null;

    @property(cc.Node)
    deck: cc.Node = null;

    @property(cc.AudioSource)
    cardAudioSource: cc.AudioSource = null;

    private readonly durationFlyCard = 0.6;
    private readonly durationFlyOpenCard = 0.3;
    private readonly durationFlyCardBurn = 1.3;
    private readonly durationDropCards = 0.4;
    private readonly durationPrepareOpenCards = 1;
    private readonly durationCutCard = 3.5;

    private cardCenterTween: cc.Tween;
    private allCardsFlyTween: cc.Tween;
    private allCardsDropTween: cc.Tween[];

    onLoad = () => {
        this.allCardsDropTween = [];
    };

    onHidden() {
        this.resetActions();
    }

    resetActions() {
        const skeleton = this.cutCard.getComponent(sp.Skeleton);
        skeleton.destroy();
        this.cardCenterTween.stop();
        this.allCardsFlyTween.stop();
        this.centerCard?.children[0].stopAllActions();
        this.allCardsDropTween?.forEach((cardTween: cc.Tween) => {
            cardTween.stop();
        });
    }

    async handleShowNewShoe(data: Blockchain, duration: number) {
        const cutCardValue = data.chain?.[0]?.card;
        const formatData: BlockchainCardModel[] = data.chain.slice(1, data.burnedCards);

        if (duration >= TimeShowAnim.full) {
            this.deck.active = false;
            this.cutCard.active = true;
            const skeleton = this.cutCard.getComponent(sp.Skeleton);
            skeleton.timeScale = this.getSkeletonDuration(skeleton) / this.durationCutCard;
            const isCached = skeleton?.isAnimationCached();
            if (isCached) {
                skeleton.setAnimationCacheMode(sp.Skeleton.AnimationCacheMode.REALTIME);
            } else {
                skeleton.setAnimationCacheMode(sp.Skeleton.AnimationCacheMode.SHARED_CACHE);
            }
            skeleton.setCompleteListener(async () => {
                this.deck.active = true;
                this.cutCard.active = false;
                this.actionBurnCards(formatData, cutCardValue, 1);
            });
        } else if (duration >= TimeShowAnim.burnCard && duration < TimeShowAnim.full) {
            this.actionBurnCards(formatData, cutCardValue, this.durationPrepareOpenCards);
        } else {
            this.actionBurnCards(formatData, cutCardValue, 0, false);
        }
    }

    private async actionBurnCards(data: BlockchainCardModel[], cardValue: CardModel, duration: number, isAnimation = true) {
        await this.handleShowBurnCard(cardValue, isAnimation);
        if (isAnimation) {
            await this.flyAllCards(data, duration);
        } else {
            data.forEach((data: BlockchainCardModel, index: number) => {
                this.createCardsBurn(this.cardPrefab, index, data.card, false, (card: cc.Node) => {
                    card.children[0].angle = 0;
                });
            });
        }
    }

    async handleShowBurnCard(cardData: CardModel, isAnimation = true) {
        const card = cc.instantiate(this.cardPrefab);
        this.burnCard.removeAllChildren(true);
        this.centerCard.removeAllChildren(true);

        if (isAnimation) {
            card.scale = 0.5;
            card.angle = -135;
            const cardComponent = card?.getComponent(BlockchainCard);
            cardComponent?.setIndexNumber(0);
            this.centerCard.addChild(card);
            this.centerCard.children[0].opacity = 0;
            await this.handleFlyCard(this.centerCard.children[0], this.durationFlyCardBurn, this.cardsBox, cardData);
        } else {
            this.burnCard.addChild(card);
            const cardComponent = card?.getComponent(BlockchainCard);
            cardComponent?.setStatusIndexNumber(false);
            cardComponent?.setCardOldStyle(cardData);
            cardComponent?.faceUp();
        }
    }

    handleDropCards() {
        this.dropCards(this.burnCard.children[0], this.cardsDrop, 0.6, this.durationDropCards);
        this.dropCards(this.centerCard.children[0], this.cardsDrop, 0.6, this.durationDropCards);
        this.containerBurnCards.children.forEach((card) => {
            this.dropCards(card?.children?.[0], this.cardsDrop, 0.6, this.durationDropCards);
        });
    }

    private handleFlyCard(card: cc.Node, duration: number, start: cc.Node, cardData: CardModel): Promise<void> {
        const cardComponent = card?.getComponent(BlockchainCard);
        return new Promise((resolve) => {
            this.cardCenterTween = cc
                .tween(card)
                .call(() => {
                    cardComponent?.setCardOldStyle(cardData);
                    this.actionCardFly({
                        card: card,
                        start
                    });
                    cardComponent?.playAnimation(CardAnimation.DealerOpenCard, this.durationFlyOpenCard);
                })
                .delay(duration)
                .call(() => resolve())
                .start();
        });
    }

    private flyAllCards(formatData: BlockchainCardModel[], duration: number) {
        const prefabCard = this.cardPrefab;
        return new Promise<void>((resolve) => {
            this.allCardsFlyTween = cc
                .tween(this)
                .call(() => {
                    this.centerCard.children[0].runAction(
                        cc.moveTo(this.durationFlyCard, cc.v2(this.burnCard.x, this.burnCard.y)).easing(cc.easeInOut(2))
                    );
                })
                .call(() => {
                    formatData.forEach((data: BlockchainCardModel, index: number) => {
                        this.createCardsBurn(prefabCard, index, data.card, true, (card: cc.Node) => {
                            card.children[0].opacity = 0;
                            this.actionCardFly({ card: card.children[0], start: this.cardsBox });
                        });
                    });
                })
                .delay(duration)
                .call(() => {
                    resolve();
                })
                .start();
        });
    }

    private actionCardFly({ card, start }: { card: cc.Node; start: cc.Node }) {
        const convertCardBox: cc.Vec3 = cc.v3(card.parent.convertToNodeSpaceAR(start.convertToWorldSpaceAR(cc.v2(0, 0))));
        const cardPosition = card.position;
        card.position = convertCardBox;
        card.opacity = 255;
        card.runAction(
            cc.spawn(
                cc.rotateTo(this.durationFlyCard, 0).easing(cc.easeInOut(2)),
                cc.scaleTo(this.durationFlyCard, 1).easing(cc.easeInOut(2)),
                cc.moveTo(this.durationFlyCard, cc.v2(cardPosition.x, cardPosition.y)).easing(cc.easeInOut(2))
            )
        );
        playFlyCardAudio(card, this.cardAudioSource?.clip);
    }

    private dropCards(card: cc.Node, cardsDrop: cc.Node, durationJumpToBoxCard: number, duration: number): Promise<void> {
        return (
            card &&
            new Promise<void>((resolve) => {
                const worldPosition = cardsDrop.convertToWorldSpaceAR(cc.v2(0, 0));
                const destPosition = card.parent.convertToNodeSpaceAR(worldPosition);
                const cardComponent: BlockchainCard = card?.getComponent(BlockchainCard);
                cardComponent?.setStatusInfoTag(false);

                const dropTween = cc
                    .tween(card)
                    .call(() => {
                        cardComponent?.playAnimation(CardAnimation.DropCard, 0.6);
                    })
                    .then(cc.jumpTo(durationJumpToBoxCard, destPosition, 250, 1))
                    .call(() => {
                        card.opacity = 0;
                        card.angle = -135;
                        card.active = false;
                    })
                    .delay(duration)
                    .call(() => {
                        resolve();
                    })
                    .start();

                this.allCardsDropTween.push(dropTween);
            })
        );
    }

    private getSkeletonDuration(skeleton: sp.Skeleton) {
        return skeleton.findAnimation(skeleton.defaultAnimation).duration;
    }

    private createCardsBurn(
        prefabCard: cc.Prefab,
        index: number,
        cardData: CardModel,
        isAnimation: boolean,
        callback: (card: cc.Node, cardData?: CardModel) => void
    ) {
        const cardPrefab = cc.instantiate(prefabCard);
        const card = this.containerBurnCards.children[index];
        card.removeAllChildren();
        card.addChild(cardPrefab);
        isAnimation && (cardPrefab.scale = 0.5);
        cardPrefab.angle = -135;
        const cardComponent = card.children[0]?.getComponent(BlockchainCard);
        cardComponent?.setIndexNumber(index + 1);
        callback(card, cardData);
    }
}
