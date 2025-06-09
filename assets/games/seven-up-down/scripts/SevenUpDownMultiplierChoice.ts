import AnimationUtils from "../../../common/utils/AnimationUtils";
import SevenUpDownMultiplierItem from "./SevenUpDownMultiplierItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SevenUpDownMultiplierChoice extends cc.Component {
    @property(cc.Node)
    nodeMultiplier: cc.Node = null;

    @property(cc.Prefab)
    pfbMultiplier: cc.Prefab = null;

    @property(sp.Skeleton)
    spineMultiplier: sp.Skeleton = null;

    @property(sp.Skeleton)
    spineParticle: sp.Skeleton = null;

    private readonly MULTIPLIER_NUMBER = 13;
    private readonly NO_ANIM_MULTIPLIER = 16;
    private readonly OFFSET_MULTIPLIER = 510;

    public listMultiplierOrigin = [];
    public multiplierValue = 0;
    private multiplierTween: cc.Tween = null;

    onDisable() {
        this.multiplierTween?.stop();
    }

    async showMultiplier(animated: boolean) {
        this.nodeMultiplier.opacity = 255;
        AnimationUtils.playSpine(this.spineParticle, "show", true);
        if (animated) {
            this.appendMultiplier();
            this.animRollingMultiplier();
            AnimationUtils.playSpine(this.spineMultiplier, "show");
        } else {
            AnimationUtils.playSpine(this.spineMultiplier, "idle", false);
            this.setFinalMultiplier();
        }
    }

    animRollingMultiplier() {
        this.nodeMultiplier.position = cc.v3(this.nodeMultiplier.position.x, 26, 0);
        const waitingDuration = 0.26;
        this.multiplierTween?.stop();
        this.multiplierTween = cc
            .tween(this.nodeMultiplier)
            .delay(waitingDuration)
            .to(1.2, { position: cc.v2(this.nodeMultiplier.x, -238) })
            .to(1.83, { position: cc.v2(this.nodeMultiplier.x, -this.OFFSET_MULTIPLIER) })
            .to(0.67, { position: cc.v2(this.nodeMultiplier.x, -498) })
            .start();
    }

    setFinalMultiplier() {
        this.nodeMultiplier.addChild(this.renderMultiplierValue(this.multiplierValue));
    }

    getFinalMultiplier() {
        return this.nodeMultiplier.children[0];
    }

    appendMultiplier() {
        const listMultipliers = this.generateRandomMultipliers();
        this.setFinalMultiplier();

        for (const multiplier of listMultipliers) {
            const item = this.renderMultiplierValue(multiplier);
            this.nodeMultiplier.addChild(item);
        }

        this.nodeMultiplier.getComponent(cc.Layout).updateLayout();
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
        const hideDurationTime = 0.4;
        const t = cc.tween;
        t(this.nodeMultiplier)
            .parallel(
                t().to(hideDurationTime, { opacity: 0 }, { easing: "sineOut" }),
                t().call(() => {
                    const lastNode = this.getFinalMultiplier();
                    cc.tween(lastNode).to(0.06, { scale: 1.2 }).to(0.06, { scale: 1 }).to(0.2, { scale: 0.5 }).start();
                })
            )
            .call(() => {
                this.resetMultiplierChoice();
            })
            .start();
        AnimationUtils.playSpine(this.spineMultiplier, "hide");
    }

    resetMultiplierChoice() {
        this.node.active = false;
        this.nodeMultiplier.destroyAllChildren();
        this.nodeMultiplier.position = cc.v3(this.nodeMultiplier.position.x, -this.NO_ANIM_MULTIPLIER, 0);
        this.nodeMultiplier.scale = 1;
    }

    generateRandomMultipliers(): number[] {
        if (!this.listMultiplierOrigin || this.listMultiplierOrigin.length === 0) {
            return [];
        }

        let listMultiplier: number[] = [];
        const reverseList = this.listMultiplierOrigin.slice().reverse();
        const length = this.listMultiplierOrigin.length;
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
