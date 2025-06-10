import { BetModel } from "../_base_new/models/BetModel";

export class SoloBetModel extends BetModel {
    static Events = {
        ...BetModel.Events,
        CONFIRM_BET: "confirmBet"
    };

    protected queueBet: any[] = [];
    protected currentBet = 0;

    setCurrentBet(bet: number) {
        this.currentBet = bet;
    }

    clearTempBet() {
        this.queueBet = [];
    }

    addTempBet(bet: { choice: string; amount: number }) {
        this.queueBet.push(bet);
    }

    addBet(choice: string) {
        this.addTempBet({ choice, amount: this.currentBet });
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
