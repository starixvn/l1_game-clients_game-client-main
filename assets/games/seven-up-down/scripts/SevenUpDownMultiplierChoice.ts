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

    public listMultiplierOrgin = [];
    public multiplierValue = 0;

    showMultiplier(animated: boolean) {
        if (animated) {
            AnimationUtils.playSpine(this.spineMultiplier, "show");
            this.appendMultiplier();
            this.animRollingMultiplier();
        } else {
            this.lblMultiplier.position.y = -this.noAnimMultiplierPosY;
            this.lblMultiplier.addChild(this.renderMultiplierValue(this.multiplierValue));
        }
    }

    animRollingMultiplier() {
        this.lblMultiplier.position = cc.v3(this.lblMultiplier.position.x, -this.noAnimMultiplierPosY, 0);
        this.lblMultiplier.opacity = 255;
        const normalSpinDuration = 3;
        cc.tween(this.lblMultiplier)
            .delay(0.2)
            .to(normalSpinDuration, { position: cc.v2(this.lblMultiplier.x, -this.OFFSET_MULTIPLIER) }, { easing: "sineOut" })
            .start();
    }

    setFinalMultiplier() {
        this.lblMultiplier.addChild(this.renderMultiplierValue(this.multiplierValue));
    }

    appendMultiplier() {
        this.lblMultiplier.destroyAllChildren();
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
            this.node.active = false;
            return;
        }
        const hideDurationTime = 0.2;
        cc.tween(this.lblMultiplier)
            .to(hideDurationTime, { opacity: 0 }, { easing: "sineOut" })
            .call(() => {
                this.node.active = false;
            })
            .start();
        AnimationUtils.playSpine(this.spineMultiplier, "hide");
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
