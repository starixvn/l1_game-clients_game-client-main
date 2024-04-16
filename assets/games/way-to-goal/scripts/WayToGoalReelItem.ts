import SlotReelItem from "../../_slotgame_base/SlotReelItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class WayToGoalReelItem extends SlotReelItem {
    @property({ visible: false, override: true })
    winningEffect: cc.Node = null;

    @property({ visible: false, override: true })
    effectSpine: sp.Skeleton = null;

    showWinningEffect(show: boolean) {
        this.content.children.forEach((child) => {
            const animation = child.getChildByName("icon").children[0].getComponent(cc.Animation);
            if (animation) {
                const anim = show ? "highlight" : "idle";
                animation.play(anim);
            }
            const winningEffectAbove = child.getChildByName("winning-effect-above");
            if (winningEffectAbove) {
                winningEffectAbove.active = show;
            }
        });
    }
}
