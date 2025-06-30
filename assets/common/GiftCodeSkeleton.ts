import CallbackSkeleton from "./CallbackSkeleton";


const { ccclass, property } = cc._decorator;

@ccclass
export default class GiftCodeSkeleton extends CallbackSkeleton {
    @property(cc.Float)
    public time = 1;

    @property(cc.Node)
    background: cc.Node = null;

    onShowPopup: () => void = null;

    protected onDestroy(): void {
        this.unscheduleAllCallbacks();
    }

    play() {
        this.duration && this.updateDuration(this.duration);
        if (this.background) {
            this.background.opacity = 150;
        }
        this.scheduleOnce(() => {
            if (this.background) {
                cc.tween(this.background)
                    .to(1, { opacity: 0 }, { easing: "sineOut" })
                    .call(() => {
                        this.background.active = false;
                    })
                    .start();
            }
            this.onShowPopup && this.onShowPopup();
        }, this.time);
        this.effect.setAnimation(0, this.effect.animation, false);
    }
}
