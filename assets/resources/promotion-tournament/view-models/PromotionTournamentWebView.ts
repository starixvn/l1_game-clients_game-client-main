import CustomWebView from "../../../common/CustomWebView";
import LoadWebView from "../../../common/LoadWebView";
import CommonDialog from "../../../common/_base/view-models/CommonDialog";
import { promotionTournamentHandler } from "../../../lobby/promotions/PromotionTournamentHandler";

const CLOSE_PROMOTION_EVENT = "closePromotionPopup";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PromotionTournamentWebView extends LoadWebView {
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

        super.onLoad();
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
        this.showLoading();
        this.hideWebView();
        this.webView._impl.setVisible(true);

        const url = promotionTournamentHandler.getListPromotionUrl();
        this.webView && (this.webView.url = url);
    }

    showWebView() {
        this.webView._impl.setVisible(true);
        this.webView.setOpacity(255);
    }
}
