import DataHandler from "../../_base/handlers/DataHandler";
import SlotGameBase from "../SlotGameBase";

export default class SlotGameIngameHandler implements DataHandler {
    constructor(protected readonly main: SlotGameBase) {}

    handle(data: any) {
        if (data.freeSpins && data.freeSpins.total) {
            const { bet, total, paylines } = data.freeSpins;
            this.main.setTotalFreeSpins(total);
            this.main.setStake(bet);
            this.main.setBetChoices(paylines);

            this.main.updateDisplaySpinButtons();
            this.main.stakeButton && (this.main.stakeButton.interactable = false);
            this.main.lineButton && (this.main.lineButton.interactable = false);
            this.main.autoSpinToggle && (this.main.autoSpinToggle.interactable = false);
        }
    }
}
