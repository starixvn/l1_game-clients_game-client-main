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

    initPromotion(promotionInfo: any) {
        if (!promotionInfo) return;
    
        const promotion = promotionInfo.promotion;
        const gameOffer = promotionInfo.gameOfferPromotion?.[0];
    
        const betLevel = promotion?.betLevel ?? gameOffer?.betLevel ?? 0;
        const totalFreeSpin = promotion?.remainingBonusItems ?? 0;
        const endTime = promotion?.endTime ?? null;
    
        this.promotionActive = true;
        this.endTime = endTime;
    
        this.labelBetLevel.string = betLevel.toString();
        this.labelFSB.string = totalFreeSpin.toString();
        this.labelTotalWin.string = "0";
        this.labelTotalBet.string = (betLevel * this.getLinesCount()).toString();
    
        // Optional: schedule countdown if needed
        // this.schedule(this.checkPromotionEnded, 1);
    }
    

    updateRemainingFSB(fsbLeft: number) {
        this.labelFSB.string = fsbLeft.toString();
    }

    addWinAmount(amount: number) {
        this.totalWin += amount;
        this.labelTotalWin.string = this.totalWin.toString();
    }

    getLinesCount(): number {
        // gọi từ slotGameBase
        return 0;
       // return cc.find("Canvas").getComponentInChildren(SlotGameBase)?.betChoices?.length || 0;
    }

    checkPromotionEnded() {
        const fsbLeft = parseInt(this.labelFSB.string);
        const now = Date.now();
        if (fsbLeft <= 0 || now > this.endTime) {
            this.promotionActive = false;
            this.unschedule(this.checkPromotionEnded);
            this.hidePanel();
            this.showPromotionEndedPopup();
        }
    }

    hidePanel() {
        this.node.active = false;
    }

    showPromotionEndedPopup() {
        //uiManager.showMessage("Promotion Ended", "Your Free Spin Bonus has ended.");
    }
}
