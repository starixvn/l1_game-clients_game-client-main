import { Socket } from "socket.io-client";
import { FreeSpinsPromotionEvents, freeSpinsPromotionHandler } from "../../lobby/free-spin-bonus-promotion/FreeSpinsPromotionHandler";
import { uiManager } from "../../managers/GameUIManager";
import BaseComponent from "../../common/BaseComponent";
import { i18n } from "../../ClientModules";
import SimpleClaimButton from "./SimpleClaimButton";
import { numberWithCommas } from "../../common/helpers/NumberHelper";
import { TurnOverRequiredEvents } from "./TurnOverRequiredHandler";
import NoticeUtil from "../../common/utils/NoticeUtil";
import { appManager } from "../../managers/AppManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TurnOverRequiredPanel extends BaseComponent {
    @property(cc.Label) labelTotalWin: cc.Label = null;
    @property(cc.Label) labelTotalTurnover: cc.Label = null;
    @property(cc.Label) labelMinRequiredTurnover: cc.Label = null;
    @property(cc.Label) labelPercentage: cc.Label = null;
    @property(cc.ProgressBar) progressBar: cc.ProgressBar = null;
    @property(cc.Node) claimButton: cc.Node = null;
    @property(cc.Label) labelTimer: cc.Label = null;
    @property(cc.Label) labelMainMessage: cc.Label = null;
    @property(cc.Label) labelSubMessage: cc.Label = null;

    private totalWinAmount = 0;
    private totalTurnover = 0;
    private minRequiredTurnover = 0;
    private progressPercentage = 0;
    private endTime = 0;
    private gameName: string;
    protected socket: Socket;
    private boundReceiveData: (data: any) => void;

    onLoad() {
        this.schedule(this.updateTimer, 1);
        uiManager.emitterListener(TurnOverRequiredEvents.UPDATE_TURN_OVER_REQUIRED, (data) => this.updateBonusWallet(data), this);
    }

    init(socket: Socket, gameName: string, promotionTOProgress: any) {
        this.socket = socket;
        this.gameName = gameName;
        this.boundReceiveData = this.receivedData.bind(this);
        this.socket.on(this.gameName, this.boundReceiveData);
        this.updateBonusWallet(promotionTOProgress);
    }

    public updateBonusWallet(data: { win: number; totalTO: number; minTO: number; progress: number; expire: string }) {
        this.totalWinAmount = data?.win;
        this.totalTurnover = data?.totalTO;
        this.minRequiredTurnover = data?.minTO;
        this.progressPercentage = data?.progress;
        this.endTime = new Date(data?.expire).getTime();

        this.updateProgressUI();
        this.updateTimer();
    }

    receivedData(data: any) {
        if (!this.isAlive()) {
            return;
        }
        const claimBtnCtrl = this.claimButton.getComponent(SimpleClaimButton);
        if (data.errorCode) {
            const message = NoticeUtil.getLocalizedErrorMessage(data.errorCode, { errorCode: data.errorCode });
            const noticeData = { text: message };
            appManager.currentScene?.showNotice(noticeData);
            if (claimBtnCtrl) {
                claimBtnCtrl.setClaimable(this.progressPercentage >= 100);
            }
        }
    }

    public updateTotalWinAndTurnover(totalWin: number, turnover: number) {
        this.totalWinAmount = totalWin;
        this.totalTurnover = turnover;
        this.updateProgressUI();
    }

    private updateProgressUI() {
        this.labelTotalWin.string = numberWithCommas(this.totalWinAmount, 2);
        this.labelTotalTurnover.string = numberWithCommas(this.totalTurnover, 2);
        this.labelMinRequiredTurnover.string = numberWithCommas(this.minRequiredTurnover, 2);

        this.labelPercentage.string = `${this.progressPercentage}%`;
        this.progressBar.progress = this.progressPercentage / 100;

        this.getProgressMessage();

        const isReadyToClaim = this.progressPercentage >= 100;
        const claimBtnCtrl = this.claimButton.getComponent(SimpleClaimButton);
        if (claimBtnCtrl) {
            claimBtnCtrl.setClaimable(isReadyToClaim);
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
        const dayText = i18n.t("freeSpinsPromotion.FSB_days");
        this.labelTimer.string = `${days} ${dayText} ${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
    }

    private pad(num: number): string {
        return num < 10 ? `0${num}` : `${num}`;
    }

    public onClickClaim() {
        if (!this.socket?.connected) {
            return;
        }

        const claimBtnCtrl = this.claimButton.getComponent(SimpleClaimButton);
        if (claimBtnCtrl) {
            claimBtnCtrl.setClaimable(false);
        }

        this.socket.emit("claim-bonus-win");
    }

    onClickInfoIcon() {
        freeSpinsPromotionHandler.setIsAnnouncementDetailsActive(true);
        uiManager.emitter.emit(FreeSpinsPromotionEvents.OPEN_FREE_SPINS_PROMOTION);
    }

    onDestroy() {
        this.socket?.off(this.gameName, this.boundReceiveData);
    }

    private getProgressMessage() {
        const value = this.progressPercentage;
        let mainMessageKey = "";
        let subMessageKey = "";

        if (value >= 100) {
            mainMessageKey = "freeSpinsPromotion.FSB_notification_para1a";
            subMessageKey = "freeSpinsPromotion.TO_requirement_state4_message";
        } else if (value >= 81) {
            mainMessageKey = "freeSpinsPromotion.TO_requirement_state3_message";
            subMessageKey = "freeSpinsPromotion.TO_requirement_state3_message1";
        } else if (value >= 41) {
            mainMessageKey = "freeSpinsPromotion.TO_requirement_state2_message";
            subMessageKey = "freeSpinsPromotion.TO_requirement_state2_message1";
        } else {
            mainMessageKey = "freeSpinsPromotion.TO_requirement_state1_message";
            subMessageKey = "freeSpinsPromotion.TO_requirement_state1_message1";
        }

        this.labelMainMessage.string = i18n.t(mainMessageKey).toUpperCase();
        this.labelSubMessage.string = i18n.t(subMessageKey);
    }
}
