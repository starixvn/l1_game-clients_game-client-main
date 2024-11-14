import AutoSpinSettingDialog from "../../_slotgame_base/AutoSpinSettingDialog";
import SlotGameBase from "../../_slotgame_base/SlotGameBase";
import SlotGameSongs from "../../_slotgame_base/SlotGameSongs";

const { ccclass, property } = cc._decorator;

export const HeroesSlotId = 38;

@ccclass
export default class HeroesSlot extends SlotGameBase {
    @property(cc.Node)
    bgAutoSpinDialog: cc.Node = null;

    @property({ type: SlotGameSongs, override: true, visible: false })
    gameSongList: SlotGameSongs = null;

    constructor() {
        super();
        this.gameId = HeroesSlotId;
    }

    createAutoSpinDialog(): AutoSpinSettingDialog {
        const dialog = super.createAutoSpinDialog();
        this.bgAutoSpinDialog.active = true;
        dialog.dialog.addOnDidHide(() => {
            this.bgAutoSpinDialog.active = false;
        });
        return dialog;
    }
}
