import CommonDialog from "../../../common/_base/view-models/CommonDialog";
import { CardModel } from "../../../common/new-card/view-models/NewCard";
import { uiManager } from "../../../managers/GameUIManager";
import BlackJackUtils from "../../blackjack/view-models/BlackJackUtils";
import HandPlace from "../../blackjack/view-models/HandPlace";
import { CHINESE_BLACKJACK_EMIT_EVENTS } from "./ChineseBlackjack";
import ChineseBlackjackUtils from "./ChineseBlackjackUtils";

const { ccclass, property, executeInEditMode } = cc._decorator;
@ccclass
@executeInEditMode
export default class ChineseBlackjackHandPlace extends HandPlace {
    @property(cc.Node)
    fiveCardsNode: cc.Node = null;

    @property(cc.Node)
    banBanNode: cc.Node = null;

    @property(cc.Node)
    unqualifiedNode: cc.Node = null;

    @property(CommonDialog)
    popupStand: CommonDialog = null;

    public standClickCallback = () => {
        // handle
    };

    onLoad() {
        this.registerEvents();
        super.onLoad();
    }

    registerEvents() {
        uiManager.emitterListener(CHINESE_BLACKJACK_EMIT_EVENTS.STAND_CLICK, () => this.handleReceiveEmitStand(), this);
    }

    onDestroy() {
        uiManager.removeListenersWithTarget(this);
    }

    resetView() {
        super.resetView();
        this.fiveCardsNode && (this.fiveCardsNode.active = false);
        this.banBanNode && (this.banBanNode.active = false);
        this.unqualifiedNode && (this.unqualifiedNode.active = false);
    }

    updateDisplayScore(final: boolean, isBlackjack = false) {
        if (!this.data) {
            this.scoreValue.string = "";
            this.showScore(false);
            return;
        }
        this.showScore(true);
        if (final) {
            if (this.data.isStand) {
                const scoreValue = Math.max(...this.data.total);
                this.scoreValue.string = scoreValue.toString();
                this.showExtraInfo(this.data.cards, scoreValue, isBlackjack);
            } else {
                this.scoreValue.string = this.data.total.join(" / ");
            }
        } else {
            const card = this.data.cards[0];
            const values = BlackJackUtils.getValues(card.rank);
            this.scoreValue.string = values.join(" / ");
        }
    }

    showExtraInfo(cards: CardModel[], total: number, isBlackjack = false) {
        if (ChineseBlackjackUtils.isFiveCards(cards, total)) {
            this.handleExtraInfoDisplay(this?.fiveCardsNode);
            return;
        }

        if (total > 21) {
            this.handleExtraInfoDisplay(this?.burstNode);
            return;
        }

        if (ChineseBlackjackUtils.isBanLuck(cards)) {
            this.handleExtraInfoDisplay(this?.blackJackNode);
            return;
        }

        if (ChineseBlackjackUtils.isBanBan(cards)) {
            this.handleExtraInfoDisplay(this?.banBanNode);
        }

        if (!isBlackjack && ChineseBlackjackUtils.isUnqualified(cards, total)) {
            this.handleExtraInfoDisplay(this?.unqualifiedNode);
        }
    }

    private handleExtraInfoDisplay(node: cc.Node) {
        if (node) {
            node.active = true;
            this.showScore(false);
        }
    }

    isBlackJackHandPlace(cards: CardModel[], total: number): boolean {
        return total === 21 && cards.length === 2;
    }

    showExtraInfoDealerPlace(cards: CardModel[], total: number) {
        this.showExtraInfoHandPlace(cards, total);
    }

    showScoreWithOutData(cards: CardModel[], cardNum: number, final = false) {
        this.showScore(true);
        const values = ChineseBlackjackUtils.getTotal(cards, cardNum);
        if (final) {
            const total = values[values.length - 1];
            this.scoreValue.string = total.toString();
            this.showExtraInfo(cards, total);
        } else {
            this.scoreValue.string = values.join(" / ");
        }
    }

    onConfirmStand() {
        this.standClickCallback();
        this.popupStand.closeDialog();
    }

    handleReceiveEmitStand() {
        if (this.selected) {
            this.handleStandClick();
        }
    }

    handleStandClick() {
        const scoreValue = Math.max(...this.data.total);
        if (scoreValue < 16) {
            this.popupStand.showDialog();
        } else {
            this.standClickCallback();
        }
    }

    onConfirmWithoutStand() {
        uiManager.emitter.emit(CHINESE_BLACKJACK_EMIT_EVENTS.STAND_CLICK_NO, true);
        this.popupStand.closeDialog();
    }
}
