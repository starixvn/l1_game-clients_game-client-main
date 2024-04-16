import { i18n } from "../../../../../ClientModules";
import { BlockchainBaccaratRoundHistory } from "../../../event-models/BlockchainBaccaratRoundHistory";
import BlockchainBaccaratCardsUI from "../../../view-models/BlockchainBaccaratCardsUI";
import { BaccaratSettlementResult } from "./../../../../baccarat/view-models/event-models/BaccaratSettlementResult";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BlockchainBaccaratLastRoundInfo extends cc.Component {
    @property(cc.Label)
    lastRoundLabel: cc.Label = null;

    @property(cc.Node)
    cardsUI: cc.Node = null;

    @property(cc.Node)
    playerCard3: cc.Node = null;

    @property(cc.Node)
    bankerCard3: cc.Node = null;

    @property(cc.Label)
    winNoticeLabel: cc.Label = null;

    private readonly winNotice = {
        banker: "blockchainBaccarat.banker_win",
        player: "blockchainBaccarat.player_win",
        tie: "blockchainBaccarat.tie_win"
    };

    onLoad() {
        this.reset();
    }

    reset() {
        this.cardsUI.active = false;
        this.winNoticeLabel.node.getParent().active = false;
    }

    updateUI(lastRound: BlockchainBaccaratRoundHistory, currentIndex: number) {
        if (!lastRound) {
            return;
        }
        this.updateCards(lastRound, currentIndex);
        this.updateWinNoticeLabel(lastRound.settlementResult);
    }

    private updateCards(lastRound: BlockchainBaccaratRoundHistory, currentIndex: number) {
        this.cardsUI.active = true;
        this.playerCard3.active = lastRound.result.player.card3 !== null;
        this.bankerCard3.active = lastRound.result.banker.card3 !== null;
        this.cardsUI.getComponent(BlockchainBaccaratCardsUI).showCardsWithoutAnimation(lastRound, currentIndex);
    }

    private updateWinNoticeLabel(settlementResult: BaccaratSettlementResult) {
        this.winNoticeLabel.node.getParent().active = true;
        let key = this.winNotice.tie;
        if (settlementResult.banker) {
            key = this.winNotice.banker;
        } else {
            if (settlementResult.player) {
                key = this.winNotice.player;
            }
        }
        this.winNoticeLabel.string = i18n.t(key).toUpperCase();
    }
}
