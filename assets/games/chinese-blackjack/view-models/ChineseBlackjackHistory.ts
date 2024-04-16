import { BetHistoryModel } from "../../_base_new/types/bet-history/BetHistoryModel.";
import BlackJackHistory from "../../blackjack/view-models/BlackJackHistory";
import { IDataLog } from "./ChineseBlackjackHistoryItem";
import ChineseBlackjackHistoryItemGroup from "./ChineseBlackjackHistoryItemGroup";

const { ccclass } = cc._decorator;

@ccclass
export default class ChineseBlackjackHistory extends BlackJackHistory {
    constructor() {
        super();
        this.enablePF = true;
    }

    onData(data: BetHistoryModel<IDataLog>) {
        const { page, pageSize, total, betLogs } = data;
        this.pagination.onSet(page, pageSize, total);
        this.content.destroyAllChildren();
        this.scrollView?.scrollToTop(0.1);

        if (!betLogs?.length) {
            return;
        }

        this.updateUI(betLogs);
    }

    updateUI(betLogs: IDataLog[]) {
        let currentRoundId = 0;
        let currentItemGroupComponent: ChineseBlackjackHistoryItemGroup;
        let enableBg = true;
        betLogs.forEach((betLog, index) => {
            const isFirstRow = index === 0;
            const isLastRow = index === betLogs.length - 1;
            const isNewRound = currentRoundId !== betLog.roundId;

            const addNewGroupItem = (isLastRow: boolean) => {
                const itemGroup = cc.instantiate(this.itemGroupPrefab);
                currentItemGroupComponent = itemGroup.getComponent(ChineseBlackjackHistoryItemGroup);
                this.content.addChild(itemGroup);
                currentItemGroupComponent.init(this.socket);
                currentItemGroupComponent.addItem(betLog, index, isLastRow);
                currentItemGroupComponent.roundId = betLog.roundId;
            };

            if (isFirstRow) {
                addNewGroupItem(isLastRow);
            } else if (isNewRound) {
                enableBg = !enableBg;
                addNewGroupItem(isLastRow);
            } else {
                currentItemGroupComponent.addItem(betLog, index, isLastRow);
            }
            currentRoundId = betLog.roundId;

            currentItemGroupComponent.node.height = currentItemGroupComponent.container.height;
        });
    }
}
