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
}
