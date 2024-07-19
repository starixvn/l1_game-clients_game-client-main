import CustomWebView from "../../../common/CustomWebView";
import CommonDialog from "../../../common/_base/view-models/CommonDialog";
import { promotionTournamentHandler } from "../../../lobby/promotions/PromotionTournamentHandler";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PromotionTournamentWebView extends cc.Component {
    @property(CustomWebView)
    webView: CustomWebView = null;

    @property(CommonDialog)
    commonDialog: CommonDialog = null;

    onLoad(): void {
        this.loadPromotionSite();
        if (this.commonDialog) {
            this.commonDialog.addOnDidHide(() => {
                this.node.destroy();
            });
        }
    }

    loadPromotionSite() {
        const url = promotionTournamentHandler.getListPromotionUrl();
        this.webView && (this.webView.url = url);
    }
}
