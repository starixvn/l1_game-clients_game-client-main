import SlotGameBase from "../../_slotgame_base/SlotGameBase";
import { FortuneCatSlotConfigs } from "./FortuneCatSlotConfigs";

const { ccclass, property } = cc._decorator;

export const FortuneCatsId = 62;

@ccclass
export default class FortuneCat extends SlotGameBase {
    @property({ type: cc.AudioSource, override: true, visible: false })
    musicBg: cc.AudioSource = null;
    songListConfig = {
        SC1: ["SC1/song1"]
    };

    constructor() {
        super();
        this.gameId = FortuneCatsId;
    }

    initSlotGameConfig() {
        this.slotGameConfigs = new FortuneCatSlotConfigs();
    }
}
