import CommonDialog from "../../../common/_base/view-models/CommonDialog";
import LoadWebView from "../../../common/LoadWebView";
import BetDetailFrame from "../../../common/new-history/BetDetailFrame";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewTicketDetailBase extends LoadWebView {
    backWrapper: cc.Node = null;
    isShowTitleBetDetail = true;
    betDetailFrame: BetDetailFrame;

    setURL(url: string) {
        this.url = url;
    }

    loadWebView() {
        if (this.url) {
            this.showLoading();
            this.hideWebView();
            this.webView._impl.setVisible(true);

            this.webView.url = this.url;
        }
    }

    initBetDetailFrame(node: cc.Node) {
        this.betDetailFrame = node.getComponent(BetDetailFrame);
        this.backWrapper = this.betDetailFrame.backWrapper;
        this.betDetailFrame.isShowTitleBetDetail = this.isShowTitleBetDetail;
        const commonDialog = this.backWrapper.getComponent(CommonDialog);
        commonDialog.addOnDidHide(() => {
            this.node.destroy();
        });
    }
}
