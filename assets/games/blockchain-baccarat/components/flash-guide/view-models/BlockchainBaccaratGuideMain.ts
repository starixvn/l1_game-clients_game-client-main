import TutorialMain from "../../../../../common/tutorial/TutorialMain";
const { ccclass, property } = cc._decorator;

@ccclass
export default class BlockchainBaccaratGuideMain extends TutorialMain {
    @property(cc.Node)
    popUp: cc.Node = null;

    private touchOffset = cc.v2(0, 0);
    private started = false;

    onLoad() {
        super.onLoad();
        cc.sys.isMobile && this.enableTouch();
    }

    enableTouch() {
        this.popUp.on(cc.Node.EventType.TOUCH_START, this.eventStart, this, true);
        this.popUp.on(cc.Node.EventType.TOUCH_END, this.eventEnd, this, true);
        this.popUp.on(cc.Node.EventType.TOUCH_CANCEL, this.handleReleaseTouch, this, true);
    }

    onDestroy() {
        if (cc.sys.isMobile) {
            this.popUp.off(cc.Node.EventType.TOUCH_START, this.eventStart, this, true);
            this.popUp.off(cc.Node.EventType.TOUCH_END, this.eventEnd, this, true);
            this.popUp.off(cc.Node.EventType.TOUCH_CANCEL, this.handleReleaseTouch, this, true);
        }
    }

    handleReleaseTouch(e) {
        if (!this.started) {
            return;
        }
        this.started = false;
        const location = e.getLocation();
        const delta = location.x - this.touchOffset.x;
        if (Math.abs(delta) >= 100) {
            if (delta > 0) {
                this.currentIndex > 0 && this.onClickPrevious();
            } else {
                this.currentIndex < this.items.length - 1 && this.onClickNext();
            }
        }
    }

    eventEnd(e) {
        this.handleReleaseTouch(e);
        const location = e.getLocation();
        const delta = location.x - this.touchOffset.x;
        if (Math.abs(delta) > 10) {
            e.stopPropagation();
        }
    }

    eventStart(e) {
        this.started = true;
        const location = e.getLocation();
        this.touchOffset = cc.v2(location.x, location.y);
    }
}
