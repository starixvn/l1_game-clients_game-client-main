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

    @property(sp.Skeleton)
    spineParticle: sp.Skeleton = null;

    private readonly MULTIPLIER_NUMBER = 27;
    private readonly noAnimMultiplierPosY = 16;
    private readonly OFFSET_MULTIPLIER = 1016;

    public listMultiplierOrgin = [];
    public multiplierValue = 0;

    async showMultiplier(animated: boolean) {
        this.lblMultiplier.opacity = 255;
        if (animated) {
            this.appendMultiplier();
            this.animRollingMultiplier();
            console.timeEnd("check --------");
            AnimationUtils.playSpine(this.spineMultiplier, "show");
            AnimationUtils.playSpine(this.spineParticle, "show");
        } else {
            this.lblMultiplier.position.y = -this.noAnimMultiplierPosY;
            this.setFinalMultiplier();
        }
    }

    animRollingMultiplier() {
        this.lblMultiplier.position = cc.v3(this.lblMultiplier.position.x, -this.noAnimMultiplierPosY, 0);
        const normalSpinDuration = 4;
        cc.tween(this.lblMultiplier)
            .to(normalSpinDuration - 0.13 * 3 - 0.26, { position: cc.v2(this.lblMultiplier.x, -this.OFFSET_MULTIPLIER) })
            .delay(0.26)
            .call(() => {
                const lastNode = this.lblMultiplier.children[0];
                cc.tween(lastNode).to(0.13, { scale: 1.3 }).to(0.13, { scale: 0.8 }).to(0.13, { scale: 1 }).start();
            })
            .start();
    }

    setFinalMultiplier() {
        this.lblMultiplier.addChild(this.renderMultiplierValue(this.multiplierValue));
    }

    appendMultiplier() {
        const listMultipliers = this.genarateRandomMultipliers();
        this.setFinalMultiplier();

        for (const multiplier of listMultipliers) {
            const item = this.renderMultiplierValue(multiplier);
            this.lblMultiplier.addChild(item);
        }

        this.lblMultiplier.getComponent(cc.Layout).updateLayout();
    }

    renderMultiplierValue(value: number) {
        const multiplierItem = cc.instantiate(this.pfbMultiplier);
        const comp = multiplierItem.getComponent(SevenUpDownMultiplierItem);
        comp.multiplierValue = value;
        return multiplierItem;
    }

    hideMultiplier(animated: boolean) {
        if (!animated) {
            this.resetMultiplierChoice();
            return;
        }
        const hideDurationTime = 0.2;
        cc.tween(this.lblMultiplier)
            .to(hideDurationTime, { opacity: 0 }, { easing: "sineOut" })
            .call(() => {
                this.resetMultiplierChoice();
            })
            .start();
        AnimationUtils.playSpine(this.spineMultiplier, "hide");
    }

    resetMultiplierChoice() {
        this.node.active = false;
        this.lblMultiplier.destroyAllChildren();
        this.lblMultiplier.position.y = -this.noAnimMultiplierPosY;
    }

    genarateRandomMultipliers() {
        if (!this.listMultiplierOrgin || this.listMultiplierOrgin.length === 0) {
            return;
        }
        let listMultiplier = [];

        const reverseList = this.listMultiplierOrgin.slice().reverse();
        const length = this.listMultiplierOrgin.length;
        const mod = this.MULTIPLIER_NUMBER % length;
        const countLoop = Math.floor(this.MULTIPLIER_NUMBER / length);
        for (let i = 0; i < countLoop; i++) {
            listMultiplier = [...listMultiplier, ...reverseList];
        }
        if (mod > 0) {
            listMultiplier = [...listMultiplier, ...reverseList.slice(0, mod)];
        }
        return listMultiplier;
    }
}
