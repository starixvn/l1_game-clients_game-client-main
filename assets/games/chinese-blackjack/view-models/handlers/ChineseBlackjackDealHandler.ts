import NewCard, { CardAnimation, CardModel } from "../../../../common/new-card/view-models/NewCard";
import DealHandler, { DrawCardAction } from "../../../blackjack/view-models/handlers/DealHandler";
import { IHand } from "./ChineseBlackjackFinishHandler";

export interface IDeal {
    roundId: number;
    totalAmount: number;
    uid: string;
    dealer?: CardModel[];
    hands: IHand[];
}

export default class ChineseBlackjackDealHandler extends DealHandler {
    handle(data) {
        super.handle(data);
        if (data.chineseBlackjackNotice) {
            this.processFailedDealHands(data.chineseBlackjackNotice);
        }
    }

    drawFirstDealerCard(dealerCards: CardModel[], actions: DrawCardAction[]) {
        actions.push(() => {
            this.main.drawingCardToDealer(null, true);
        });
    }

    drawSecondDealerCardWithNormalCase(dealerCards: CardModel[], actions: DrawCardAction[]) {
        this.drawFirstDealerCard(dealerCards, actions);
    }

    drawSecondDealerCardWithBlackJack(dealerCards: CardModel[], actions: DrawCardAction[]) {
        this.drawFirstDealerCard(dealerCards, actions);
    }

    playAnimationDealerCheck(dealerCards: CardModel[], isBlackJack: boolean) {
        let delayTime = 1;
        const checkDuration = 1.5;
        this.main.dealerHand.cardLayout.content.children.forEach((child) => {
            child.getComponent(NewCard).playAnimation(CardAnimation.DealerCheckBlackJackFail, checkDuration);
        });

        delayTime += checkDuration;

        isBlackJack ? this.main.inRoundActionVisibility(false) : this.main.disabledInRoundAction(true);

        cc.tween(this.main)
            .delay(delayTime)
            .call(() => {
                this.main.startRound();
            })
            .start();
    }
}
