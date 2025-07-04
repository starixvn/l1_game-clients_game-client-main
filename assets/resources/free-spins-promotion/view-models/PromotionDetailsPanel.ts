import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import { FreeSpinsPromotionEvents, freeSpinsPromotionHandler } from "../../../lobby/promotions/FreeSpinsPromotionHandler";
import { uiManager } from "../../../managers/GameUIManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PromotionDetailsPanel extends cc.Component {
    @property(cc.Label) labelTotalWin: cc.Label = null;
    @property(cc.Label) labelFSB: cc.Label = null;
    @property(cc.Label) labelBetLevel: cc.Label = null;
    @property(cc.Label) labelTotalBet: cc.Label = null;
    private readonly DEFAULT_LINES = 25;

    private totalWin = 0;
    private promotionActive = false;
    private betLevel = 0;
    private promotionFSB = 0;
    private fsbConsumedThisRound = false;
    private hasServerFinishPromotion = false;

    public markServerConfirmedEnd() {
        this.hasServerFinishPromotion = true;
        if (!this.fsbConsumedThisRound) {
            this.tryShowPromotionEndedPopupIfFinished();
        }
    }

    initPromotion(promotionInfo: any, isAutoSpin: boolean) {
        if (!promotionInfo) {
            return;
        }

        const promotion = promotionInfo.promotion;

        this.betLevel = promotion?.betLevel ?? 0;
        this.promotionFSB = promotion?.remainingBonusItems ?? 0;
        this.totalWin = Number(promotion?.totalWin ?? 0);
        this.promotionActive = true;

        this.labelBetLevel.string = this.betLevel.toString();
        this.labelFSB.string = this.promotionFSB.toString();
        this.labelTotalWin.string = numberWithCommas(this.totalWin, 2);
        this.updateTotalBetLabel();
        this.node.active = true;

        if (this.promotionFSB > 0 && isAutoSpin) {
            uiManager.emitter.emit(FreeSpinsPromotionEvents.SPIN_ON_FSB_PROMOTION);
        }
    }

    tryConsumePromotionFSB() {
        if (this.promotionActive && this.promotionFSB > 0 && !this.fsbConsumedThisRound) {
            this.promotionFSB--;
            this.fsbConsumedThisRound = true;
            this.labelFSB.string = this.promotionFSB.toString();
        }
    }

    revertLastPromotionFSB() {
        if (this.fsbConsumedThisRound) {
            this.promotionFSB++;
            this.fsbConsumedThisRound = false;
            this.labelFSB.string = this.promotionFSB.toString();
        }
    }

    commitPromotionFSB() {
        if (this.fsbConsumedThisRound) {
            this.fsbConsumedThisRound = false;
        }
    }

    addWinAmount(amount: number) {
        if (!this.promotionActive || amount <= 0) {
            return;
        }

        this.totalWin += amount;
        this.labelTotalWin.string = numberWithCommas(this.totalWin, 2);
    }

    public isPromotionStillActive(): boolean {
        return this.promotionActive && !this.hasServerFinishPromotion;
    }

    updateTotalBetLabel() {
        const totalBet = this.betLevel * this.DEFAULT_LINES;
        this.labelTotalBet.string = totalBet.toString();
    }

    hidePanel() {
        this.node.active = false;
    }

    public tryShowPromotionEndedPopupIfFinished() {
        if (this.hasServerFinishPromotion) {
            this.hidePanel();
            this.showPromotionEndedPopup();
        }
    }

    showPromotionEndedPopup() {
        uiManager.emitter.emit(FreeSpinsPromotionEvents.OPEN_PROMOTION_ENDED_POPUP, freeSpinsPromotionHandler.getFinishPromotion());
    }
}
