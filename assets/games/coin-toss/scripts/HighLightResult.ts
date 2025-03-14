const { ccclass, property } = cc._decorator;

@ccclass
export class HighlightResult extends cc.Component {
    @property(cc.Node)
    confetiHeads: cc.Node = null;

    @property(cc.Node)
    confetiTails: cc.Node = null;

    @property(cc.Animation)
    winHeads: cc.Animation = null;

    @property(cc.Animation)
    winTails: cc.Animation = null;

    protected onLoad(): void {
        this.hide();
    }

    setStatusNode(node: cc.Node, status: boolean) {
        node && (node.active = status);
    }

    hide() {
        this.setStatusNode(this.confetiHeads, false);
        this.setStatusNode(this.confetiTails, false);
        this.winHeads.stop();
        this.winTails.stop();
    }

    show(result: any) {
        const isHead = result?.head;
        const animation = isHead ? this.winHeads : this.winTails;
        animation.play();

        this.setStatusNode(this.confetiHeads, isHead);
        this.setStatusNode(this.confetiTails, !isHead);
    }
}
