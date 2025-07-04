import AnalyticsManager, { TrackingAction, TrackingEvent } from "../../analytics/AnalyticsManager";
import { uiManager } from "../../managers/GameUIManager";
import { InternalEvents } from "../../managers/InternalEvents";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CenterBannerItem extends cc.Component {
    @property(cc.Sprite)
    banner: cc.Sprite = null;

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onCloseBanner = () => {};

    private gameId = 0;
    private readonly TRACKING_OBJECT_NAME = "Center Banner";

    init(gameId: number, spriteFrame: cc.SpriteFrame) {
        this.gameId = gameId;
        this.banner.spriteFrame = spriteFrame;
    }

    onClick() {
        uiManager.emitter.emit(InternalEvents.OPEN_GAME, this.gameId);
        AnalyticsManager.Instance.trackEvent(TrackingEvent.Button, {
            location: cc.director.getScene().name,
            action: TrackingAction.Click,
            object_name: this.TRACKING_OBJECT_NAME
        });
    }

    onClose() {
        this.onCloseBanner();
    }
}
