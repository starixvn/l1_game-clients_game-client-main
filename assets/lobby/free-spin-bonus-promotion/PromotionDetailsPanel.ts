import DraggableItem from "../../common/draggable-layout/view-models/DraggableItem";
import { numberWithCommas } from "../../common/helpers/NumberHelper";
import { FreeSpinsPromotionEvents, freeSpinsPromotionHandler } from "../../lobby/free-spin-bonus-promotion/FreeSpinsPromotionHandler";
import { uiManager } from "../../managers/GameUIManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PromotionDetailsPanel extends cc.Component {
    @property(cc.Label) labelTotalWin: cc.Label = null;
    @property(cc.Label) labelFSB: cc.Label = null;
    @property(cc.Label) labelTotalBet: cc.Label = null;
    private readonly DEFAULT_LINES = 25;

    private totalWin = 0;
    private betLevel = 0;

    protected onLoad(): void {
        this.dragDetailPanel();
        uiManager.emitterListener(
            FreeSpinsPromotionEvents.CLOSE_PROMOTION_DETAILS_PANEL,
            () => {
                this.hidePanel();
            },
            this
        );
        uiManager.emitterListener(
            FreeSpinsPromotionEvents.UPDATE_FSB_COUNT,
            (count: number) => {
                this.updateFSBCount(count);
            },
            this
        );
        uiManager.emitterListener(
            FreeSpinsPromotionEvents.UPDATE_TOTAL_WIN,
            (amount: number) => {
                this.updateTotalWin(amount);
            },
            this
        );
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

        this.labelFSB.string = remainingBonusItems.toString();
        this.labelTotalWin.string = numberWithCommas(this.totalWin, 2, false);

        this.updateTotalBet();
        this.node.active = true;

        if (remainingBonusItems > 0 && isAutoSpin) {
            uiManager.emitter.emit(FreeSpinsPromotionEvents.SPIN_ON_FSB_PROMOTION);
        }
    }

    updateTotalWin(amount: number) {
        this.totalWin += amount;
        this.labelTotalWin.string = numberWithCommas(this.totalWin, 2, false);
    }

    updateTotalBet() {
        const totalBet = this.betLevel * this.DEFAULT_LINES;
        this.labelTotalBet.string = numberWithCommas(totalBet, 2, false);
    }

    hidePanel() {
        this.node.active = false;
    }

    onClickInfoIcon() {
        uiManager.emitter.emit(FreeSpinsPromotionEvents.COLLAPSE_MENU);
        freeSpinsPromotionHandler.activeDetailPromo = true;
        uiManager.emitter.emit(FreeSpinsPromotionEvents.OPEN_FREE_SPINS_PROMOTION);
    }

    onDestroy() {
        uiManager.removeListenersWithTarget(this);
    }

    updateFSBCount(count: number) {
        this.labelFSB.string = count.toString();
    }
}
