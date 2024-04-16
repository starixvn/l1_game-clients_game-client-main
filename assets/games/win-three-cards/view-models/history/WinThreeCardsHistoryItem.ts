import AudioManager from "../../../../common/audio/AudioManager";
import { getStringDateByTime } from "../../../../common/helpers/DateTimeHelper";
import { numberWithCommas } from "../../../../common/helpers/NumberHelper";
import NewCard from "../../../../common/new-card/view-models/NewCard";
import SocketIOHistoryItemBase from "../../../_base/view-models/SocketIOHistoryItemBase";
import { Choices } from "../WinThreeCardsConstant";
import { WinThreeCardsBetData } from "../WinThreeCardsModel";
import WinThreeCardsHistory from "./WinThreeCardsHistory";
import WinThreeCardsHistoryResult from "./WinThreeCardsHistoryResult";

const { ccclass, property } = cc._decorator;
@ccclass
export default class WinThreeCardsHistoryItem extends SocketIOHistoryItemBase {
    @property(cc.Label)
    amountLabel: cc.Label = null;

    @property(cc.Prefab)
    ticketDetailPrefab: cc.Prefab = null;

    @property({ type: NewCard })
    cards: NewCard[] = [];

    @property({ type: WinThreeCardsHistoryResult })
    cardResultDragon: WinThreeCardsHistoryResult = null;

    @property({ type: WinThreeCardsHistoryResult })
    cardResultPhoenix: WinThreeCardsHistoryResult = null;

    data: WinThreeCardsBetData = null;

    public showTicketDetail = (data: WinThreeCardsBetData) => {
        // handle
    };

    historyMainNode: WinThreeCardsHistory = null;

    setData(betData: WinThreeCardsBetData) {
        this.data = betData;
        const dragonCards = betData.result.dragon;
        const phoenixCards = betData.result.phoenix;
        const isDragonWin = betData?.settlementResult?.dragon;
        const isPhoenixWin = betData?.settlementResult?.phoenix;

        this.time.string = getStringDateByTime(betData.time);
        this.round.string = betData.phien;
        this.win.string = numberWithCommas(betData.betwin, 2);
        this.amountLabel.string = this.summarizeBet(betData);
        this.cardResultDragon && this.cardResultDragon.setData(dragonCards, isDragonWin);
        this.cardResultPhoenix && this.cardResultPhoenix.setData(phoenixCards, isPhoenixWin);
    }

    showBackground(show: boolean) {
        this.bg.active = show;
    }

    private summarizeBet(data: WinThreeCardsBetData): string {
        return numberWithCommas(Object.values(Choices).reduce((total, choice) => total + data[choice], 0));
    }

    private openTicketDetail() {
        AudioManager.getInstance().playClick();
        this.showTicketDetail(this.data);
    }
}
