import PromotionNotificationsHandler, { PromotionNotificationsEvent } from "./PromotionNotificationsHandler";

const { ccclass, property } = cc._decorator;

export const BoostedOddsEvent = {
    SHOW_PROMOTION_ANNOUNCEMENT: "SHOW_PROMOTION_ANNOUNCEMENT"
};
@ccclass
export default class BoostedOdds extends cc.Component {
    @property(cc.Node)
    icon: cc.Node = null;

    onLoad() {
        PromotionNotificationsHandler.getInstance().on(PromotionNotificationsEvent.OPEN_ANNOUNCEMENT, this.onClickBoostedOdds.bind(this));
    }

    handleBoostedOdds() {
        cc.tween(this.icon)
            .call(() => (this.icon.active = true))
            .delay(10)
            .call(() => (this.icon.active = false))
            .start();
    }

    onDisable() {
        this.node.stopAllActions();
    }

    onClickBoostedOdds() {
        this.node?.emit(BoostedOddsEvent.SHOW_PROMOTION_ANNOUNCEMENT);
    }
}
