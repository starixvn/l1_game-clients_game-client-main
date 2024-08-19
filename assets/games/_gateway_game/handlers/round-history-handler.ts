import { Store } from "../models/definitions";
import { RoundHistoryStore } from "../models/round-history-store";
import { BaseEventHandler } from "./base-event-handler";
interface RoundHistoryType {
    roundHistory?: any[];
    finish?: any;
}
export class RoundHistoryHandler extends BaseEventHandler<any> {
    protected verifyEvent(event: RoundHistoryType): boolean {
        return !!event.roundHistory || !!event.finish;
    }

    protected handle(data: RoundHistoryType) {
        const store = this.gameData.getStore(Store.RoundHistory) as RoundHistoryStore;
        const lastRound = store.roundHistory[0];
        if (data.roundHistory) {
            const roundHistory = data.roundHistory;
            if (roundHistory[0] && lastRound && roundHistory[0].roundId < lastRound.roundId) {
                roundHistory.unshift(...store.roundHistory);
            } else {
                roundHistory.push(...store.roundHistory);
            }
            store.roundHistory = roundHistory.filter(
                (round, index, histories) => histories?.findIndex((history) => +history.roundId === +round.roundId) === index
            );
        } else if (data.finish) {
            const newRoundId = data.finish.roundId;

            if (lastRound && lastRound.roundId >= newRoundId) {
                return;
            }
            store.roundHistory.unshift(data.finish);
        }

        store.updateUI();
    }
}
