const { ccclass, property } = cc._decorator;

@ccclass
export class HighlightResult extends cc.Component {
    @property(cc.Node)
    heads: cc.Node = null;

    @property(cc.Node)
    tails: cc.Node = null;

    protected onLoad(): void {
        this.hide();
    }

    setStatusNode(node: cc.Node, status: boolean) {
        node && (node.active = status);
    }

    hide() {
        this.setStatusNode(this.heads, false);
        this.setStatusNode(this.tails, false);
    }

    show(result: any) {
        const isHead = result?.head;

        this.setStatusNode(this.heads, isHead);
        this.setStatusNode(this.tails, !isHead);
    }
}
