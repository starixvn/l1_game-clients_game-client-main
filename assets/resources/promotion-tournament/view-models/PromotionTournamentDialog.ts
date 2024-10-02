import CommonDialog from "../../../common/_base/view-models/CommonDialog";
import PromotionTournamentHandler from "../../../lobby/promotions/PromotionTournamentHandler";

const { ccclass } = cc._decorator;

@ccclass
export default class PromotionTournamentDialog extends CommonDialog {
    closeDialog(enableSound = true) {
        PromotionTournamentHandler.getInstance().onClosePromotionTournamentPopup();
        super.closeDialog(enableSound);
    }
}