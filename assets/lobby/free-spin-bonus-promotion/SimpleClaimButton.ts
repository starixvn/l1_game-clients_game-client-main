const { ccclass, property } = cc._decorator;

@ccclass
export default class SimpleClaimButton extends cc.Component {
    @property(cc.Node)
    activeNode: cc.Node = null;

    @property(cc.Node)
    disableNode: cc.Node = null;

    public setClaimable(isClaimable: boolean) {
        if (this.activeNode) {
            this.activeNode.active = isClaimable;
        }
        if (this.disableNode) {
            this.disableNode.active = !isClaimable;
        }

        const btn = this.getComponent(cc.Button);
        if (btn) {
            btn.interactable = isClaimable;
        }
    }

    startClaimButtonPulse() {
        const node = this.node;
        node.scale = 1.0;

        cc.tween(node)
            .repeatForever(
                cc
                    .tween()
                    .to(0.2, { scale: 0.93 }, { easing: "sineIn" })
                    .to(0.4, { scale: 1.05 }, { easing: "sineOut" })
                    .to(0.3, { scale: 1.0 }, { easing: "sineInOut" })
            )
            .start();
    }

    stopClaimButtonPulse() {
        cc.Tween.stopAllByTarget(this.node);
    }
}
