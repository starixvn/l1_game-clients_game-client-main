import { uiManager } from "../../managers/GameUIManager";
import { InternalEvents } from "../../managers/InternalEvents";
import PromotionNotificationsHandler, { PromotionNotificationsEvent } from "./PromotionNotificationsHandler";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PromotionNotifications extends cc.Component {
    @property(cc.Node)
    icon: cc.Node = null;

    @property(cc.Node)
    countNode: cc.Node = null;

    isLoadedPromotionAnnouncement = false;
    isReceivedPromotionData = false;

    onLoad() {
        PromotionNotificationsHandler.getInstance().on(PromotionNotificationsEvent.NEW_PROMOTION, this.showNotification.bind(this));

        if (PromotionNotificationsHandler.getInstance().promotionNotifications) {
            this.showNotification();
        }

        if (uiManager.prefabCache.miniPanelIcons["promotionAnnouncements"]) {
            this.onLoadedPromotionAnnouncement();
        }

        uiManager.emitterListener(InternalEvents.LOADED_PROMOTION_ANNOUNCEMENT, this.onLoadedPromotionAnnouncement.bind(this), this);
    }

    onDestroy() {
        uiManager.removeListenersWithTarget(this);
    }

    showNotification() {
        const promotion = PromotionNotificationsHandler.getInstance().promotionNotifications;
        if (!this.icon || !this.countNode) {
            return;
        }
        this.icon.active = false;

        if (promotion?.length > 0) {
            this.isReceivedPromotionData = true;
            this.countNode.getChildByName("count").getComponent(cc.Label).string = promotion?.length.toString();
            this.checkToShowNotification();
        }
    }

    onClickNotification() {
        PromotionNotificationsHandler.getInstance().emit(PromotionNotificationsEvent.OPEN_ANNOUNCEMENT);
    }

    private checkToShowNotification() {
        if (!this.icon || !this.isLoadedPromotionAnnouncement || !this.isReceivedPromotionData) {
            return;
        }
        this.icon.active = true;
    }

    private onLoadedPromotionAnnouncement() {
        this.isLoadedPromotionAnnouncement = true;
        this.checkToShowNotification();
    }
}
