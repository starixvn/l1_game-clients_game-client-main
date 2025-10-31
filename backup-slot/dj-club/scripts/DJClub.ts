import StandardSlotGame from "../../_slotgame_base/StandardSlotGame";
import { DJClubSlotConfigs } from "./DJClubSlotConfigs";

const { ccclass } = cc._decorator;

@ccclass
export default class DJClub extends StandardSlotGame {
    constructor() {
        super();
    }

    initSlotGameConfig() {
        this.slotGameConfigs = new DJClubSlotConfigs();
    }
}
