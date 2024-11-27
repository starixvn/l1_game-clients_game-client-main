import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import { EmitterEvents, Store } from "../models/definitions";
import RenderItem from "./render-item";
const { ccclass, property } = cc._decorator;

@ccclass
export default class GameInfoRender extends RenderItem {
    @property(cc.Label)
    labelRTP: cc.Label = null;

    @property(cc.Label)
    labelTotalOnlineUsers: cc.Label = null;

    @property(cc.Label)
    labelMinBet: cc.Label = null;

    @property(cc.Label)
    labelMaxBet: cc.Label = null;

    onLoad() {
        const data = this._gameData;
        const store = data.getStore(Store.GameInfo);
        store?.addListener(EmitterEvents.RtpChange, this.onChangeRTP, this);
        store?.addListener(EmitterEvents.TotalOnlineChange, this.onChangeTotalOnlineUser, this);
        store?.addListener(EmitterEvents.BetLimitChange, this.onChangeBetLimit, this);

        store?.wakeUp();
    }

    clearRenderListeners() {
        const store = this._gameData?.getStore(Store.GameInfo);
        store?.removeAll(this);
    }

    onChangeBetLimit = (data: { minBet: number; maxBet: number }) => {
        if (!data) {
            return;
        }
        if (this.labelMinBet) {
            this.labelMinBet.string = numberWithCommas(data.minBet);
        }
        if (this.labelMaxBet) {
            this.labelMaxBet.string = numberWithCommas(data.maxBet);
        }
    };
    onChangeTotalOnlineUser = (data: number) => {
        if (!this.labelTotalOnlineUsers) {
            return;
        }
        this.labelTotalOnlineUsers.string = numberWithCommas(data);
    };
    onChangeRTP = (data: number) => {
        if (!this.labelRTP) {
            return;
        }
        this.labelRTP.string = `${numberWithCommas(data, 2)}%`;
    };
}
