import DraggableItem from "../../common/draggable-layout/view-models/DraggableItem";
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
    private betLevel = 0;
    private fsbConsumedThisRound = false;
    private hasServerFinishPromotion = false;

    public markServerConfirmedEnd() {
        this.hasServerFinishPromotion = true;
        if (!this.fsbConsumedThisRound) {
            this.tryShowEndedPopup();
        }
    }
    protected onLoad(): void {
      this.dragDetailPanel();
    }

    dragDetailPanel() {
        const draggableItem = this.getComponent(DraggableItem);
        if (draggableItem) {
            draggableItem.touchCallback.end = (isClicked) => {
                if (isClicked) {
                    uiManager.emitter.emit(FreeSpinsPromotionEvents.COLLAPSE_MENU);
                }
            };
        }
    }

    initPromotion(promotionInfo: any, isAutoSpin: boolean) {
        if (!promotionInfo?.promotion) {
            return;
        }

        const { betLevel = 0, remainingBonusItems = 0, totalWin = 0 } = promotionInfo.promotion;

        this.betLevel = betLevel;
        freeSpinsPromotionHandler.currentSpinCount = remainingBonusItems;
        this.totalWin = Number(totalWin);

        this.labelBetLevel.string = betLevel.toString();
        this.labelFSB.string = remainingBonusItems.toString();
        this.labelTotalWin.string = numberWithCommas(this.totalWin, 2);

        this.updateTotalBet();
        this.node.active = true;

        if (remainingBonusItems > 0 && isAutoSpin) {
            uiManager.emitter.emit(FreeSpinsPromotionEvents.SPIN_ON_FSB_PROMOTION);
        }
    }

    tryConsumeFSB() {
        if (freeSpinsPromotionHandler.currentSpinCount > 0 && !this.fsbConsumedThisRound) {
            freeSpinsPromotionHandler.currentSpinCount--;
            this.fsbConsumedThisRound = true;
            this.labelFSB.string = freeSpinsPromotionHandler.currentSpinCount.toString();
        }
    }

    revertLastFSB() {
        if (this.fsbConsumedThisRound) {
            freeSpinsPromotionHandler.currentSpinCount++;
            this.fsbConsumedThisRound = false;
            this.labelFSB.string = freeSpinsPromotionHandler.currentSpinCount.toString();
        }
    }

    commitFSB() {
        if (this.fsbConsumedThisRound) {
            this.fsbConsumedThisRound = false;
        }
    }

    addWinAmount(amount: number) {
        if (freeSpinsPromotionHandler.currentSpinCount < 0 || amount <= 0) {
            return;
        }

        this.totalWin += amount;
        this.labelTotalWin.string = numberWithCommas(this.totalWin, 2);
    }

    public isStillActive(): boolean {
        return freeSpinsPromotionHandler.currentSpinCount >= 0 && !this.hasServerFinishPromotion;
    }

    updateTotalBet() {
        const totalBet = this.betLevel * this.DEFAULT_LINES;
        this.labelTotalBet.string = totalBet.toString();
    }

    hidePanel() {
        this.node.active = false;
    }

    public tryShowEndedPopup() {
        if (this.hasServerFinishPromotion) {
            this.hidePanel();
            this.showEndedPopup();
        }
    }

    showEndedPopup() {
        uiManager.emitter.emit(FreeSpinsPromotionEvents.OPEN_PROMOTION_ENDED_POPUP, freeSpinsPromotionHandler.finishPromotion);
    }

    onClickInfoIcon() {
        uiManager.emitter.emit(FreeSpinsPromotionEvents.COLLAPSE_MENU);
        freeSpinsPromotionHandler.activeDetailPromo = true;
        uiManager.emitter.emit(FreeSpinsPromotionEvents.OPEN_FREE_SPINS_PROMOTION);
    }
}
