import DataHandler from "../../_base/handlers/DataHandler";
import SlotGameBase from "../SlotGameBase";

export default class SlotGameIngameHandler implements DataHandler {
    constructor(protected readonly main: SlotGameBase) {}

    handle(data: any) {
        if (data.freeSpins && data.freeSpins.total) {
            const { bet, total, paylines } = data.freeSpins;
            this.main.setTotalFreeSpins(total);
            let betLevel = bet;
            if (this.main.isAccelerate) {
                const betLevels = this.main.gameConfigs.betLevels.filter((betLevel) => betLevel === bet);
                if (betLevels.length === 0) {
                    betLevel = this.main.gameConfigs.defaultBetLevel;
                }
            }
            this.main.setStake(betLevel);
            this.main.setBetChoices(paylines);

            this.main.updateDisplaySpinButtons();
            this.main.stakeButton && (this.main.stakeButton.interactable = false);
            this.main.lineButtonStatus(false);
            this.main.autoSpinToggle && (this.main.autoSpinToggle.interactable = false);
        }
    }
}
