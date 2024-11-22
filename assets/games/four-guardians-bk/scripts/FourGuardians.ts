import { lazyInject } from "../../../Application";
import SlotGameBase from "../../_slotgame_base/SlotGameBase";
import SlotGameSongs from "../../_slotgame_base/SlotGameSongs";
import FourGuardiansConfig from "./FourGuardiansConfig";

const { ccclass, property } = cc._decorator;

export const FourGuardiansId = 29;

@ccclass
export default class FourGuardians extends SlotGameBase {
    @property({ type: SlotGameSongs, override: true, visible: false })
    gameSongList: SlotGameSongs = null;

    @lazyInject(FourGuardiansConfig)
    private readonly fourGuardiansConfig: FourGuardiansConfig;

    constructor() {
        super();
        this.gameId = FourGuardiansId;
    }

    public get jackpotEnabled() {
        return this.fourGuardiansConfig.jackpotEnabled;
    }
}
