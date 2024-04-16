import BlackJackIngameHandler from "../../../blackjack/view-models/handlers/BlackJackIngameHandler";

export default class PontoonInGameHandler extends BlackJackIngameHandler {
    createDealerCards(dealerCards) {
        if (!dealerCards.length) {
            this.createFaceDownCards(2);
            this.main.dealerHand.cardLayout.updateLayout();
        }
    }
}
