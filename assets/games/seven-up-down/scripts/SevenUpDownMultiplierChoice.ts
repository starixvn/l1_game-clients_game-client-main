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

    public listMultiplier = [2, 3, 4, 5, 6, 7, 8, 2, 3, 4, 5, 6, 7, 8, 2, 3, 4, 5, 6, 7, 8];
    public multiplierValue = 0;
    private OFFSET_MULTIPLIER = 864;

    onLoad() {
        this.handleSpineMultiplier("show");
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

    async handleSpineMultiplier(anim: string) {
        await AnimationUtils.playSpine(this.spineMultiplier, anim);
    }
}
