import AnimationUtils from "../../../common/utils/AnimationUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export class FlipCoin extends cc.Component {
    @property(sp.Skeleton)
    skeleton: sp.Skeleton = null;

    @property(cc.Node)
    hand: cc.Node = null;

    private readonly animName = "flip";
    private readonly durationFlipCoin = 3;

    init() {
        this.skeleton && (this.skeleton.node.active = false);
        this.hand && (this.hand.active = true);
    }

    setStatusNode(status: boolean) {
        this.node.active = status;
        this.skeleton && (this.skeleton.node.active = true);
    }

    hideSkeleton() {
        this.skeleton && (this.skeleton.node.active = false);
        this.hand && (this.hand.active = true);
    }

    async playAnim() {
        this.setStatusNode(true);
        this.hand && (this.hand.active = false);
        this.skeleton && (await AnimationUtils.playSpine(this.skeleton, this.animName, false, this.durationFlipCoin));
    }
}
