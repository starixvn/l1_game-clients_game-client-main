import { Socket } from "socket.io-client";
import { FreeSpinsPromotionEvents, freeSpinsPromotionHandler } from "../../lobby/free-spin-bonus-promotion/FreeSpinsPromotionHandler";
import { uiManager } from "../../managers/GameUIManager";
import BaseComponent from "../../common/BaseComponent";
import { i18n } from "../../ClientModules";
import SimpleClaimButton from "./SimpleClaimButton";
import { numberWithCommas } from "../../common/helpers/NumberHelper";
import { ITurnOverRequired, TurnOverRequiredEvents, turnOverRequiredHandler } from "./TurnOverRequiredHandler";
import NoticeUtil from "../../common/utils/NoticeUtil";
import { appManager } from "../../managers/AppManager";
import DraggableItem from "../../common/draggable-layout/view-models/DraggableItem";

const { ccclass, property } = cc._decorator;
interface ClaimBonusResponse {
    errorCode?: string;
    claimedAmount?: number;
}

@ccclass
export default class TurnOverRequiredPanel extends BaseComponent {
    @property(cc.Label) labelTotalWin: cc.Label = null;
    @property(cc.Label) labelTotalTurnover: cc.Label = null;
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

    onLoad() {
        this.schedule(this.updateTimer, 1);
        uiManager.emitterListener(TurnOverRequiredEvents.UPDATE_TURN_OVER_REQUIRED, (data) => this.updateBonusWallet(data), this);
        this.dragTurnOverRequired();
    }
    dragTurnOverRequired() {
        const draggableItem = this.getComponent(DraggableItem);
        if (draggableItem) {
            draggableItem.touchCallback.end = (isClicked) => {
                if (isClicked) {
                    uiManager.emitter.emit(FreeSpinsPromotionEvents.COLLAPSE_MENU);
                }
            };
        }
    }

    init(socket: Socket, gameName: string) {
        this.socket = socket;
        this.gameName = gameName;
        this.socket && this.socket.on(this.gameName, this.receivedData.bind(this));
        this.updateBonusWallet(turnOverRequiredHandler.toProgress);
    }

    public updateBonusWallet(data: ITurnOverRequired) {
        this.totalWinAmount = data?.win;
        this.totalTurnover = data?.totalTO;
        this.minRequiredTurnover = data?.minTO;
        this.progressPercentage = data?.progress;
        this.endTime = new Date(data?.expire).getTime();

        this.updateProgressUI();
        this.updateTimer();
    }

    receivedData(data: ClaimBonusResponse) {
        if (!this.isAlive()) {
            return;
        }
        const claimBtnCtrl = this.claimButton.getComponent(SimpleClaimButton);
        if (data.errorCode) {
            if (data.errorCode === "SB3023") {
                this.hidePanel();
            }
            const message = NoticeUtil.getLocalizedErrorMessage(data.errorCode, { errorCode: data.errorCode });
            const noticeData = { text: message };
            appManager.currentScene?.showNotice(noticeData);
            if (claimBtnCtrl) {
                claimBtnCtrl.setClaimable(this.progressPercentage >= 100);
                claimBtnCtrl.startClaimButtonPulse();
            }
            return;
        }
        const { claimedAmount } = data;
        if (claimedAmount) {
            this.hidePanel();
            uiManager.emitter.emit(TurnOverRequiredEvents.OPEN_CLAIM_BONUS_NOTIFICATION, claimedAmount);
        }
    }

    public updateTotalWinAndTurnover(totalWin: number, turnover: number) {
        this.totalWinAmount = totalWin;
        this.totalTurnover = turnover;
        this.updateProgressUI();
    }

    private updateProgressUI() {
        this.labelTotalWin.string = numberWithCommas(this.totalWinAmount, 2);

        const formattedTotalTO = numberWithCommas(this.totalTurnover, 2);
        const formattedMinRequiredTO = numberWithCommas(this.minRequiredTurnover, 2);
        this.labelTotalTurnover.string = `${formattedTotalTO} / ${formattedMinRequiredTO}`;

        this.labelPercentage.string = `${this.progressPercentage}%`;
        this.progressBar.progress = this.progressPercentage / 100;

        this.getProgressMessage();

        const isReadyToClaim = this.progressPercentage >= 100;
        const claimBtnCtrl = this.claimButton.getComponent(SimpleClaimButton);
        if (claimBtnCtrl) {
            claimBtnCtrl.setClaimable(isReadyToClaim);
            if (isReadyToClaim) {
                claimBtnCtrl.startClaimButtonPulse();
            } else {
                claimBtnCtrl.stopClaimButtonPulse();
            }
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
        const dayText = i18n.t("FreeSpinBonus.FSB_days");
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
            claimBtnCtrl.stopClaimButtonPulse();
        }
        uiManager.emitter.emit(FreeSpinsPromotionEvents.COLLAPSE_MENU);
        this.socket.emit("claim-bonus-win");
    }

    onClickInfoIcon() {
        uiManager.emitter.emit(FreeSpinsPromotionEvents.COLLAPSE_MENU);
        freeSpinsPromotionHandler.activeDetailPromo = true;
        uiManager.emitter.emit(FreeSpinsPromotionEvents.OPEN_FREE_SPINS_PROMOTION);
    }

    onDestroy() {
        this.socket.on(this.gameName, this.receivedData.bind(this));
        uiManager.removeListenersWithTarget(this);
    }

    private getProgressMessage() {
        const value = this.progressPercentage;
        let mainMessageKey = "";
        let subMessageKey = "";

        if (value >= 100) {
            mainMessageKey = "FreeSpinBonus.FSB_notification_para1a";
            subMessageKey = "FreeSpinBonus.TO_requirement_state4_message";
        } else if (value >= 81) {
            mainMessageKey = "FreeSpinBonus.TO_requirement_state3_message";
            subMessageKey = "FreeSpinBonus.TO_requirement_state3_message1";
        } else if (value >= 41) {
            mainMessageKey = "FreeSpinBonus.TO_requirement_state2_message";
            subMessageKey = "FreeSpinBonus.TO_requirement_state2_message1";
        } else {
            mainMessageKey = "FreeSpinBonus.TO_requirement_state1_message";
            subMessageKey = "FreeSpinBonus.TO_requirement_state1_message1";
        }

        this.labelMainMessage.string = i18n.t(mainMessageKey).toUpperCase();
        this.labelSubMessage.string = i18n.t(subMessageKey);
    }

    hidePanel() {
        this.node.active = false;
    }
}
