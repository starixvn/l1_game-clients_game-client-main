import GameUtils from "../../../common/GameUtils";
import BetChipsNew from "../../../common/bet-chips/view-models/BetChipsNew";
import ChipConfig from "../../../common/bet-chips/view-models/ChipConfig";
import { CardModel } from "../../../common/new-card/view-models/NewCard";
import BlackJack from "../../blackjack/view-models/BlackJack";
import IngameActionHandler from "../../blackjack/view-models/handlers/IngameActionHandler";
import PontoonDealHandler from "./handlers/PontoonDealHandler";
import PontoonFinishHandler from "./handlers/PontoonFinishHandler";
import PontoonInGameHandler from "./handlers/PontoonInGameHandler";

const { ccclass, property } = cc._decorator;

export const PontoonId = 72;

@ccclass
export default class Pontoon extends BlackJack {
    @property(cc.Label)
    fiveCardsOddsLabel: cc.Label = null;

    protected moveCardDuration = 0.35;
    chipJumpHeight = 250;
    betChips: BetChipsNew;

    constructor() {
        super();
        this.gameId = PontoonId;
    }

    public get chipConfig() {
        return ChipConfig.getInstance();
    }

    setupSpecialHandler() {
        this.dealHander = new PontoonDealHandler(this);
        this.ingameActionHander = new IngameActionHandler(this);
        this.finishHandler = new PontoonFinishHandler(this);
        this.ingameHander = new PontoonInGameHandler(this);
    }

    dealerOpenFirstCard(card: CardModel, duration: number) {
        this.dealerOpenCard(card, duration, 0);
    }

    updateOdds() {
        const pontoonOdds = `${GameUtils.roundFixed(+this.gameConfigs.odds.pontoon - 1, 2)}`;
        this.blackjackOddLabel.string = GameUtils.getText("pontoon.pontoon_pay", { odds: pontoonOdds }).toUpperCase();

        const fiveCardsOdds = `${GameUtils.roundFixed(+this.gameConfigs.odds.fiveCardTrick - 1, 2)}`;
        this.fiveCardsOddsLabel.string = GameUtils.getText("pontoon.five_card_pay", { odds: fiveCardsOdds }).toUpperCase();
    }
}
