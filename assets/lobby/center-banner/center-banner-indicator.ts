import CenterBanner from "./center-banner";

const { ccclass } = cc._decorator;

@ccclass("CenterBannerIndicator")
export default class CenterBannerIndicator extends cc.Component {
    onClick() {
        try {
            const index = this.node.getSiblingIndex();
            const indicator = this.node.parent;
            const pageView = indicator.parent?.getComponent(cc.PageView);
            pageView.scrollToPage(index, 0);

            // Find the CenterBanner component and restart auto-slide

            const centerBanner = cc.find("Canvas/center-banner-container/center-banner")?.getComponent(CenterBanner);
            if (centerBanner?.onIndicatorClick) {
                centerBanner.onIndicatorClick();
            }
        } catch (error) {
            console.error("Error in CenterBannerIndicator onClick", error);
        }
    }
}
