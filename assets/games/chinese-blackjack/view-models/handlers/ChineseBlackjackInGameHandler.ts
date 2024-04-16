import BlackJackIngameHandler from "../../../blackjack/view-models/handlers/BlackJackIngameHandler";
import ChineseBlackjack from "../ChineseBlackjack";

export default class ChineseBlackjackInGameHandler extends BlackJackIngameHandler {
    get mainGame() {
        return this.main as ChineseBlackjack;
    }

    handle(data: any) {
        if (data.ownBets) {
            this.processIngame(data.ownBets, () => {
                this.mainGame.provablyFairComponent.setClientSeedUIState(false);
            });
        }
    }

    createDealerCards(dealerCards) {
        if (!dealerCards.length) {
            this.createFaceDownCards(2);
            this.main.dealerHand.cardLayout.updateLayout();
        }
    }
}
