import CustomWebView from "../../../common/CustomWebView";
import CommonDialog from "../../../common/_base/view-models/CommonDialog";
import { promotionTournamentHandler } from "../../../lobby/promotions/PromotionTournamentHandler";

const CLOSE_PROMOTION_EVENT = "closePromotionPopup";

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

        window.addEventListener("message", this.handleEvent, false);
    }

    protected onDestroy(): void {
        window.removeEventListener("message", this.handleEvent);
    }

    handleEvent = async ({ data }: { data: string }) => {
        if (data === CLOSE_PROMOTION_EVENT) {
            this.commonDialog.closeDialog();
        }
    };

    loadPromotionSite() {
        const url = promotionTournamentHandler.getListPromotionUrl();
        this.webView && (this.webView.url = url);
    }
}
