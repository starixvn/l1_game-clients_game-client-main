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

    private totalWin = 0;
    private endTime = 0;
    private promotionActive = false;
    private betLevel = 0;
    private promotionFSB = 0;
    private fsbConsumedThisRound = false;

    initPromotion(promotionInfo: any) {
        if (!promotionInfo) return;

        const promotion = promotionInfo.promotion;
        const gameOffer = promotionInfo.gameOfferPromotion?.[0];

        this.betLevel = promotion?.betLevel ?? gameOffer?.betLevel ?? 0;
        this.promotionFSB = promotion?.remainingBonusItems ?? 0;
        this.endTime = promotion?.endTime ?? null;
        this.totalWin = Number(promotion?.totalWin ?? 0);
        this.promotionActive = true;

        this.labelBetLevel.string = this.betLevel.toString();
        this.labelFSB.string = this.promotionFSB.toString();
        this.labelTotalWin.string = numberWithCommas(this.totalWin, 2);
        this.updateTotalBetLabel();
        this.node.active = true;

        if (this.promotionFSB > 0) {
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
            this.checkPromotionEnded();
        }
    }

    addWinAmount(amount: number) {
        if (!this.promotionActive || amount <= 0) return;
        this.totalWin += amount;
        this.labelTotalWin.string = numberWithCommas(this.totalWin, 2);
    }

    public isPromotionStillActive(): boolean {
        return this.promotionActive && this.promotionFSB > 0;
    }

    updateTotalBetLabel() {
        const lines = 25;
        const totalBet = this.betLevel * lines;
        this.labelTotalBet.string = totalBet.toString();
    }

    private checkPromotionEnded() {
        const now = Date.now();
        if (!this.promotionActive) return;

        if (this.promotionFSB <= 0 || (this.endTime && now > this.endTime)) {
            this.promotionActive = false;
            this.hidePanel();
            this.showPromotionEndedPopup();
        }
    }

    hidePanel() {
        this.node.active = false;
    }

    showPromotionEndedPopup() {
        uiManager.emitter.emit(FreeSpinsPromotionEvents.OPEN_PROMOTION_ENDED_POPUP, freeSpinsPromotionHandler.getFinishPromotion());
    }
}
