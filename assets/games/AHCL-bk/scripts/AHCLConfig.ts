import { injectable } from "inversify";

import { ICashSystem, ICreditSystem, System } from "../../../System";

@injectable()
export default class AHCLConfig extends System implements ICreditSystem, ICashSystem {
    constructor() {
        super();
    }

    guidePrefabUrl: string;

    customizeCredit(): void {
        this.guidePrefabUrl = "games/four-guardians/FourGuardiansGuideSC1";
    }

    customizeCash(): void {
        this.guidePrefabUrl = "games/four-guardians/FourGuardiansGuideSC2";
    }
}
