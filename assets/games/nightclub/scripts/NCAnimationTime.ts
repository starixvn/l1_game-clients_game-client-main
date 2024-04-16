import AnimatedTime from "../../../common/animated-time/view-models/AnimatedTime";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NCAnimationTime extends AnimatedTime {
    public animatedYBottom = -30;
    animatedYFinalBottom = -21.6;
}
