import { numberWithCommas } from "../../common/helpers/NumberHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ClaimBonusNotificationPopup extends cc.Component {
    @property(cc.Label) labelTotalWin: cc.Label = null;
    private static hasShown = false;

    public show(claimedAmount: number) {
        if (!claimedAmount) {
            return;
        }

        this.labelTotalWin.string = numberWithCommas(claimedAmount, 2);
        this.node.active = true;
    }

    private onCloseClicked() {
        cc.tween(this.node)
            .to(0.4, { scale: 0, opacity: 0 }, { easing: "backIn" })
            .call(() => {
                this.node.destroy();
            })
            .start();
    }
}
