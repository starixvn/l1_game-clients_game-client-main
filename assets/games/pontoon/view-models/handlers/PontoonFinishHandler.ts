import GameUtils from "../../../../common/GameUtils";
import BlackJackFinishHandler from "../../../blackjack/view-models/handlers/BlackJackFinishHandler";

export default class PontoonFinishHandler extends BlackJackFinishHandler {
    showLogNotReceiveData() {
        console.error("Ponton data finish did not receive");
    }

    async finishBlackJackCase(finish) {
        await this.openFaceDownDealerCards(finish);
        super.finishBlackJackCase(finish);
    }

    async openFaceDownDealerCards(finish) {
        this.main.dealerOpenFirstCard(finish.result[0], this.openCardDuration);
        await GameUtils.delayTime(this.openCardDuration);
        await super.openFaceDownDealerCards(finish);
    }
}
