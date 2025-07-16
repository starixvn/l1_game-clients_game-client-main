import { numberWithCommas } from "../../common/helpers/NumberHelper";
import { uiManager } from "../../managers/GameUIManager";
import { TurnOverRequiredEvents } from "./TurnOverRequiredHandler";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ClaimBonusNotificationPopup extends cc.Component {
    @property(cc.Label) labelTotalWin: cc.Label = null;

    public show(claimedAmount: number) {
        if (!claimedAmount) {
            return;
        }

        this.labelTotalWin.string = numberWithCommas(claimedAmount, 2);
        this.node.active = true;
    }

    private onCloseClicked() {
        uiManager.emitter.emit(TurnOverRequiredEvents.UPDATE_BALANCE_BONUS);
        cc.tween(this.node)
            .to(0.4, { scale: 0, opacity: 0 }, { easing: "backIn" })
            .call(() => {
                this.node.destroy();
            })
            .start();
    }
}
