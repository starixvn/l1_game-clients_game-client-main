import { injectable } from "inversify";

import { ICashSystem, ICreditSystem, System } from "../../../System";

@injectable()
export default class FourGuardiansConfig extends System implements ICreditSystem, ICashSystem {
    constructor() {
        super();
    }

    guidePrefabUrl: string;
    jackpotEnabled: boolean;

    customizeCredit(): void {
        this.guidePrefabUrl = "games/four-guardians/FourGuardiansGuideSC1";
        this.jackpotEnabled = false;
    }

    customizeCash(): void {
        this.guidePrefabUrl = "games/four-guardians/FourGuardiansGuideSC2";
        this.jackpotEnabled = true;
    }
}
