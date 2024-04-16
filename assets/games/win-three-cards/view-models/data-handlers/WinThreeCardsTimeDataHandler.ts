import BaccaratTimeDataBaseHandler from "../../../_baccarat/data-handler/BaccaratTimeDataBaseHandler";
import WinThreeCardBetItem from "../WinThreeCardBetItem";
import WinThreeCards from "../WinThreeCards";
import { clearPercentBet } from "./WinThreeCardsBetPercentHandler";

enum OrderCardFly {
    card1 = 0,
    card2,
    card3
}

export default class WinThreeCardsTimeDataHandler extends BaccaratTimeDataBaseHandler {
    protected getOwnMain(): WinThreeCards {
        return this.main as WinThreeCards;
    }

    handleInLockBetTime() {
        this.main.betItems.forEach((item) => item.setHighlight(false));
        this.getOwnMain().scoreboard.renderNextNode();
    }

    async handleFlyCards() {
        const baccarat = this.getOwnMain();
        await Promise.all([...baccarat.dragonCards.dropCards(), ...baccarat.phoenixCards.dropCards()]).catch(() => {
            // handle
        });

        this.main.setGameRound(this.main.roundId);
        clearPercentBet(this.main.betItems as WinThreeCardBetItem[]);
        this.flyAllCards();
    }

    showWaitTime() {
        this.main.timeWaitNode.active = true;
        this.main.timeWaitLabel.string = this.formatTime(
            this.main.currentTimeRemaining - this.main.config.betTime - this.dealCardsTime - 1
        );
    }

    flyAllCards() {
        const winThreeCard = this.getOwnMain();
        const gapTimeFly = 0.1;
        cc.tween(this.main.node)
            .delay(gapTimeFly)
            .call(() => winThreeCard.phoenixCards.flyCard(OrderCardFly.card1))
            .delay(gapTimeFly)
            .call(() => winThreeCard.dragonCards.flyCard(OrderCardFly.card1))
            .delay(gapTimeFly)
            .call(() => winThreeCard.phoenixCards.flyCard(OrderCardFly.card2))
            .delay(gapTimeFly)
            .call(() => winThreeCard.dragonCards.flyCard(OrderCardFly.card2))
            .delay(gapTimeFly)
            .call(() => winThreeCard.phoenixCards.flyCard(OrderCardFly.card3))
            .delay(gapTimeFly)
            .call(() => winThreeCard.dragonCards.flyCard(OrderCardFly.card3))
            .start();
    }
}
