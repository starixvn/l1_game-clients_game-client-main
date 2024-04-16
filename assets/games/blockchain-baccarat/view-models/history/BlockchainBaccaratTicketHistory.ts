import BetHistory from "../../../_new/common/BetHistory";
import BlockchainBaccaratTicketHistoryItem from "./BlockchainBaccaratTicketHistoryItem";

const { ccclass } = cc._decorator;

export interface BetLog {
    time: Date;
    phien: number;
    result: {
        player: any;
        banker: any;
    };
    banker: any;
    bankerPair: any;
    player: any;
    playerPair: any;
    big: any;
    small: any;
    tie: any;
    betwin: number;
    settlementResult: {
        banker: any;
        bankerPair: any;
        player: any;
        playerPair: any;
        big: any;
        small: any;
        tie: any;
    };
}

@ccclass
export default class BlockchainBaccaratTicketHistory extends BetHistory {
    renderTicketHistory(data: any) {
        const betLogs: BetLog[] = data.betLogs;
        betLogs.forEach((log, index) => {
            const historyItemPrefab = cc.instantiate(this.prefabItem);
            const historyControl = historyItemPrefab.getComponent(BlockchainBaccaratTicketHistoryItem);
            historyControl.setData(log, index);
            this.content.addChild(historyItemPrefab);
        });
    }
}
