import CommonDialog from "../../../common/_base/view-models/CommonDialog";
import PromotionTournamentHandler from "../../../lobby/promotions/PromotionTournamentHandler";
import MiniPanel from "../../../mini-games-panel/view-models/MiniPanel";
import LobbyDialogManager from "../../../managers/LobbyDialogManager";
const { ccclass } = cc._decorator;

@ccclass
export default class PromotionTournamentDialog extends CommonDialog {
    miniPanel: MiniPanel = null;
    closeDialog(enableSound = true) {
        PromotionTournamentHandler.getInstance().onClosePromotionTournamentPopup();
        super.closeDialog(enableSound);
        if (this.miniPanel) {
            LobbyDialogManager.getInstance().onCloseDialog();
        }
    }
}