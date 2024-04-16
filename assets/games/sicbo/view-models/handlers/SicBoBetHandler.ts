import * as _ from "lodash";

import GameBaseBetHandler from "../../../_base/handlers/GameBaseBetHandler";
import SicBo from "../SicBo";

export default class SicBoBetHandler extends GameBaseBetHandler {
    constructor(protected readonly main: SicBo) {
        super(main);
    }

    handle(data: any): boolean {
        super.handle(data);

        if (data.chips && this.main.currentTimeRemaining < this.main.config.betTime) {
            this.placeTotalChips(data.chips);
        }

        return true;
    }

    placeOwnChip(data) {
        const { betChoice, amount } = data;
        const betItem = _.find(this.main.betItems, (item) => item.node.name.toLowerCase() === betChoice.toLowerCase());

        this.main.betChips.placeChipToChipBox(amount, betItem.chipNode, null, null);
    }
}
