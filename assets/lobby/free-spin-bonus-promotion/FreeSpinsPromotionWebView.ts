import LoadWebView from "../../common/LoadWebView";
import { FreeSpinsPromotionEvents, freeSpinsPromotionHandler } from "../../lobby/free-spin-bonus-promotion/FreeSpinsPromotionHandler";
import { uiManager } from "../../managers/GameUIManager";
import FreeSpinsPromotionDialog from "./FreeSpinsPromotionDialog";

const { ccclass, property } = cc._decorator;
@ccclass
export default class FreeSpinsPromotionWebView extends LoadWebView {
    @property(FreeSpinsPromotionDialog)
    freeSpinsPromotionDialog: FreeSpinsPromotionDialog = null;

    onLoad(): void {
        this.loadFreeSpinsPromotionSite();
        uiManager.emitterListener(FreeSpinsPromotionEvents.CLOSE_FREE_SPINS_PROMOTION, this.handleCloseFreeSpinsPromotion.bind(this), this);

        super.onLoad();
    }

    handleCloseFreeSpinsPromotion() {
        this.freeSpinsPromotionDialog?.addOnDidHide?.(() => {
            this.node.destroy();
        });
    }

    loadFreeSpinsPromotionSite() {
        this.showLoading();
        this.hideWebView();
        const url = freeSpinsPromotionHandler.getPromoUrl();
        this.webView && (this.webView.url = url);
    }

    showWebView() {
        this.webView._impl.setVisible(true);
        this.webView.setOpacity(255);
    }

    onDestroy() {
        uiManager.removeListenersWithTarget(this);
    }
}
