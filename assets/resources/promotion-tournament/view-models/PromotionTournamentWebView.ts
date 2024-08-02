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
        this.webView.node.on(
            "loaded",
            () => {
                this.addCustomCSS();
            },
            this
        );

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

    addCustomCSS() {
        try {
            const iframe = this.webView?._impl?._iframe;
            if (iframe) {
                cc.log("Applying border-radius to iframe:", iframe.style);
                iframe.style.borderRadius = "30px";
                iframe.style.border = "2px solid #ffc000";
            } else {
                cc.log("iframe is null");
            }
        } catch (error) {
            cc.log("Error injecting CSS:", error);
        }
    }
}
