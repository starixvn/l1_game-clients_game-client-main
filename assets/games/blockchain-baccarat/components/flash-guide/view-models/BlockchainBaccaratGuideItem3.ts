import BlockchainBaccaratGuideItem from "./BlockchainBaccaratGuideItem";
const { ccclass, property } = cc._decorator;

@ccclass
export default class BlockchainBaccaratGuideItem3 extends BlockchainBaccaratGuideItem {
    protected anims: cc.AnimationState[] = [];
    private animTimeOut = null;

    @property(cc.Integer)
    anim2StartTime = 0;

    hide() {
        this.animTimeOut && clearTimeout(this.animTimeOut);
        super.hide();
    }

    show() {
        const animComp = this.node.getComponent(cc.Animation);
        const clips = animComp.getClips();
        if (clips[1]) {
            this.animTimeOut = setTimeout(() => {
                const anim = animComp.play(clips[1].name);
                this.anims.push(anim);
                anim.wrapMode = cc.WrapMode.Loop;
            }, this.anim2StartTime);
        }
        super.show();
    }
}
