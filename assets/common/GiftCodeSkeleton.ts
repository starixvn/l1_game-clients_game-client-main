import CallbackSkeleton from "./CallbackSkeleton";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GiftCodeSkeleton extends CallbackSkeleton {
    @property(cc.Float)
    public time = 1;

    @property(cc.Node)
    background: cc.Node = null;

    @property(sp.Skeleton)
    effect2: sp.Skeleton = null;

    onShowPopup: () => void = null;

    protected onDestroy(): void {
        this.unscheduleAllCallbacks();
    }

    play() {
        this.unscheduleAllCallbacks();
        if (this.duration) {
            this.updateDuration(this.duration);
        }

        if (this.background) {
            this.background.opacity = 150;
        }

        this.effect.setAnimation(0, this.effect.animation, false);

        if (this.effect2) {
            this.effect2.setAnimation(0, this.effect2.animation, false);
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
    }
}
