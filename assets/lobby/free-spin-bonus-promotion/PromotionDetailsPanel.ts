import { numberWithCommas } from "../../common/helpers/NumberHelper";
import { FreeSpinsPromotionEvents, freeSpinsPromotionHandler } from "../../lobby/free-spin-bonus-promotion/FreeSpinsPromotionHandler";
import { uiManager } from "../../managers/GameUIManager";

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
        if (!promotionInfo?.promotion) {
            return;
        }

        const { betLevel = 0, remainingBonusItems = 0, totalWin = 0 } = promotionInfo.promotion;
    
        this.betLevel = betLevel;
        this.promotionFSB = remainingBonusItems;
        this.totalWin = Number(totalWin);
        this.promotionActive = true;
    
        this.labelBetLevel.string = betLevel.toString();
        this.labelFSB.string = remainingBonusItems.toString();
        this.labelTotalWin.string = numberWithCommas(this.totalWin, 2);
    
        this.updateTotalBetLabel();
        this.node.active = true;
    
        freeSpinsPromotionHandler.setFreeSpinsUsedUp(remainingBonusItems === 0);
    
        if (remainingBonusItems > 0 && isAutoSpin) {
            uiManager.emitter.emit(FreeSpinsPromotionEvents.SPIN_ON_FSB_PROMOTION);
        }
    }
    

    tryConsumePromotionFSB() {
        if (this.promotionActive && this.promotionFSB > 0 && !this.fsbConsumedThisRound) {
            this.promotionFSB--;
            this.fsbConsumedThisRound = true;
            this.labelFSB.string = this.promotionFSB.toString();
            if (this.promotionFSB === 0) {
                freeSpinsPromotionHandler.setFreeSpinsUsedUp(true);
            }
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

    onClickInfoIcon() {
        freeSpinsPromotionHandler.setIsAnnouncementDetailsActive(true);
        uiManager.emitter.emit(FreeSpinsPromotionEvents.OPEN_FREE_SPINS_PROMOTION);
    }
}
