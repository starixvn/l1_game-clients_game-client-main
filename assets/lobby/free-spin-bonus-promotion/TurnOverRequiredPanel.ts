import { Socket } from "socket.io-client";
import StatusButton from "../../common/custom-button/StatusButton";
import { FreeSpinsPromotionEvents, freeSpinsPromotionHandler } from "../../lobby/free-spin-bonus-promotion/FreeSpinsPromotionHandler";
import { uiManager } from "../../managers/GameUIManager";
import BaseComponent from "../../common/BaseComponent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TurnOverRequiredPanel extends BaseComponent {
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
    private gameName: string;
    protected socket: Socket;
    private boundReceiveData: (data: any) => void;
    onLoad() {
        this.schedule(this.updateTimer, 1);
    }

    init(socket: Socket, gameName: string) {
        this.socket = socket;
        this.gameName = gameName;
        this.boundReceiveData = this.receivedData.bind(this);
        this.socket.on(this.gameName, this.boundReceiveData);
    }

    public initBonusWallet(data: { totalWinAmount: number; totalTurnover: number; minRequiredTurnover: number; endTime: number }) {
        this.totalWinAmount = data.totalWinAmount;
        this.totalTurnover = data.totalTurnover;
        this.minRequiredTurnover = data.minRequiredTurnover;
        this.endTime = data.endTime;

        this.updateProgressUI();
    }

    receivedData(data: any) {
        if (!this.isAlive()) {
            return;
        }
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

        const isReadyToClaim = percent >= 1;
        const statusBtn = this.claimButton.getComponent(StatusButton);
        if (statusBtn) {
            statusBtn.interactable = isReadyToClaim;
        }
        
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
        this.socket?.connected && this.socket.emit("claim-bonus-win");
    }

    onClickInfoIcon() {
        freeSpinsPromotionHandler.setIsAnnouncementDetailsActive(true);
        uiManager.emitter.emit(FreeSpinsPromotionEvents.OPEN_FREE_SPINS_PROMOTION);
    }

    onDestroy() {
        this.socket?.off(this.gameName, this.boundReceiveData);
    }
}
