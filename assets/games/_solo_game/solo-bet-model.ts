import { BetModel } from "../_base_new/models/BetModel";

export class SoloBetModel extends BetModel {
    static Events = {
        ...BetModel.Events,
        CONFIRM_BET: "confirmBet"
    };

    protected queueBet: any[] = [];

    clearTempBet() {
        this.queueBet = [];
    }

    addTempBet(bet: { betChoice: string; betAmount: number }) {
        this.queueBet.push(bet);
    }

    confirmBet() {
        const confirmBet = {};
        this.queueBet.forEach((bet) => {
            const currentBet = confirmBet[bet.betChoice] ?? 0;
            confirmBet[bet.betChoice] = currentBet + bet.betAmount;
        });

        this.emit(SoloBetModel.Events.CONFIRM_BET, confirmBet);
    }
}
