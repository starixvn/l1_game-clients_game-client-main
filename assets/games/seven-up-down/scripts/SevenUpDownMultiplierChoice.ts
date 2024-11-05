import SpineAttachmentNode from "../../../common/SpineAttachmentNode";
import AnimationUtils from "../../../common/utils/AnimationUtils";
import SevenUpDownMultiplierItem from "./SevenUpDownMultiplierItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SevenUpDownMultiplierChoice extends cc.Component {
    @property(cc.Node)
    lblMultiplier: cc.Node = null;

    @property(cc.Prefab)
    pfbMultiplier: cc.Prefab = null;

    @property(sp.Skeleton)
    spineMultiplier: sp.Skeleton = null;

    private readonly MULTIPLIER_NUMBER = 29;
    private readonly noAnimMultiplierPosY = 16;
    private readonly OFFSET_MULTIPLIER = 1090;
    private listMultiplier = [];
    private rollingTween: cc.Tween = null;

    public listMultiplierOrgin = [];
    public multiplierValue = 0;

    showMultiplier(animated: boolean) {
        this.rollingTween?.stop();
        this.runMultiplierAnimation(animated);
        if (animated) {
            this.appendMultiplier();
            this.animRollingMultiplier();
        } else {
            this.lblMultiplier.position.y = -this.noAnimMultiplierPosY;
            this.lblMultiplier.addChild(this.renderMultiplierValue(this.multiplierValue));
        }
    }

    animRollingMultiplier() {
        const normalSpinDuration = 3;
        this.lblMultiplier.position.y = 0;

        this.rollingTween = cc
            .tween(this.lblMultiplier)
            .delay(0.2)
            .to(normalSpinDuration, { position: cc.v2(this.lblMultiplier.x, -this.OFFSET_MULTIPLIER) }, { easing: "sineOut" })
            .start();
    }

    setFinalMultiplier() {
        this.lblMultiplier.addChild(this.renderMultiplierValue(this.multiplierValue));
    }

    appendMultiplier() {
        this.appendListMultiplierAnim();
        this.setFinalMultiplier();

        for (const multiplier of this.listMultiplier) {
            const item = this.renderMultiplierValue(multiplier);
            this.lblMultiplier.addChild(item);
        }

        this.lblMultiplier.getComponent(cc.Layout).updateLayout();
    }

    renderMultiplierValue(value: number) {
        const multiplierItem = cc.instantiate(this.pfbMultiplier);
        const comp = multiplierItem.getComponent(SevenUpDownMultiplierItem);
        const spineAttachment = multiplierItem.addComponent(SpineAttachmentNode);
        spineAttachment.skeleton = this.spineMultiplier;
        spineAttachment.boneName = "value";
        comp.multiplierValue = value;
        return multiplierItem;
    }

    runMultiplierAnimation(animated: boolean) {
        if (animated) {
            AnimationUtils.playSpine(this.spineMultiplier, "show");
        } else {
            AnimationUtils.pauseSpineAnimation(this.spineMultiplier, 1, "show");
        }
    }

    async hideMultiplier() {
        const hideDurationTime = 0.2;
        cc.tween(this.lblMultiplier).to(hideDurationTime, { opacity: 0 }, { easing: "sineOut" }).start();
        await AnimationUtils.playSpine(this.spineMultiplier, "hide");
    }

    appendListMultiplierAnim() {
        const reverseList = this.listMultiplierOrgin.slice().reverse();
        const length = this.listMultiplierOrgin.length;
        const mod = this.MULTIPLIER_NUMBER % length;
        const countLoop = Math.floor(this.MULTIPLIER_NUMBER / length);
        for (let i = 0; i < countLoop; i++) {
            this.listMultiplier = [...this.listMultiplier, ...reverseList];
        }
        if (mod > 0) {
            this.listMultiplier = [...this.listMultiplier, ...reverseList.slice(0, mod)];
        }
    }
}
