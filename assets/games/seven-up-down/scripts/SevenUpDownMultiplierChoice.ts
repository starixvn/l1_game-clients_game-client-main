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

    private MULTIPLIER_NUMBER = 29;

    public listMultiplierOrgin = [];
    private listMultiplier = [];

    public multiplierValue = 0;
    private OFFSET_MULTIPLIER = 1090;

    onLoad() {
        this.showMultiplier();
        this.appendMultiplier();
        this.animRollingMultiplier();
    }

    animRollingMultiplier() {
        const normalSpinDuration = 2.85;
        cc.tween(this.lblMultiplier)
            .delay(0.2)
            .to(normalSpinDuration, { position: cc.v2(this.lblMultiplier.x, -this.OFFSET_MULTIPLIER) }, { easing: "sineOut" })
            .start();
    }

    appendMultiplier() {
        this.appendListMultiplierAnim();
        this.lblMultiplier.addChild(this.renderMultiplierValue(this.multiplierValue));
        for (let i = 0; i < this.listMultiplier.length; i++) {
            const item = this.renderMultiplierValue(this.listMultiplier[i]);
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

    async showMultiplier() {
        await AnimationUtils.playSpine(this.spineMultiplier, "show");
    }

    async hideMultiplier() {
        cc.tween(this.lblMultiplier).to(0.3, { opacity: 0 }, { easing: "sineOut" }).start();
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
