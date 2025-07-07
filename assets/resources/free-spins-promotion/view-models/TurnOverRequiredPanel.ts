import { FreeSpinsPromotionEvents, freeSpinsPromotionHandler } from "../../../lobby/promotions/FreeSpinsPromotionHandler";
import { uiManager } from "../../../managers/GameUIManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TurnOverRequiredPanel extends cc.Component {
    @property(cc.Label) labelTotalWin: cc.Label = null;
    @property(cc.Label) labelTotalTurnover: cc.Label = null;
    @property(cc.Label) labelMinRequiredTurnover: cc.Label = null;
    @property(cc.Label) labelRemainingTO: cc.Label = null;
    @property(cc.Label) labelPercentage: cc.Label = null;
    @property(cc.ProgressBar) progressBar: cc.ProgressBar = null;
    @property(cc.Node) claimButton: cc.Node = null;
    @property(cc.Label) labelTimer: cc.Label = null;

    private totalWinAmount = 0;
    private totalTurnover = 0;
    private minRequiredTurnover = 0;
    private endTime = 0;

    onLoad() {
        this.schedule(this.updateTimer, 1);
    }

    public init(data: {
        totalWinAmount: number;
        totalTurnover: number;
        minRequiredTurnover: number;
        endTime: number;
    }) {
        this.totalWinAmount = data.totalWinAmount;
        this.totalTurnover = data.totalTurnover;
        this.minRequiredTurnover = data.minRequiredTurnover;
        this.endTime = data.endTime;
    
        this.updateProgressUI();
    }
    
    public updateTotalWinAndTurnover(totalWin: number, turnover: number) {
        this.totalWinAmount = totalWin;
        this.totalTurnover = turnover;
        this.updateProgressUI();
    }

    private updateProgressUI() {
        this.labelTotalWin.string = this.totalWinAmount.toFixed(2);
        this.labelTotalTurnover.string = this.totalTurnover.toFixed(0);
        this.labelMinRequiredTurnover.string = this.minRequiredTurnover.toFixed(0);
    
        const remainingTO = Math.max(0, this.minRequiredTurnover - this.totalTurnover);
        this.labelRemainingTO.string = remainingTO.toFixed(0);
    
        const percent = Math.min(this.totalTurnover / this.minRequiredTurnover, 1);
        this.labelPercentage.string = `${Math.floor(percent * 100)}%`;
        this.progressBar.progress = percent;
    
        this.claimButton.active = percent >= 1;
    }
    

    private updateTimer() {
        if (!this.endTime) {
            return;
        }

        const now = Date.now();
        const remaining = Math.max(0, this.endTime - now);

        const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

        this.labelTimer.string = `${days}d ${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
    }

    private pad(num: number): string {
        return num < 10 ? `0${num}` : `${num}`;
    }

    public onClickClaim() {
        // emit event or call API
        cc.log("User clicked CLAIM!");
        // uiManager.emitter.emit(...) nếu bạn có hệ thống event
    }

    onClickInfoIcon() {
        freeSpinsPromotionHandler.setIsAnnouncementDetailsActive(true);
        uiManager.emitter.emit(FreeSpinsPromotionEvents.OPEN_FREE_SPINS_PROMOTION);
    }
}
