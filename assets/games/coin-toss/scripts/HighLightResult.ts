const { ccclass, property } = cc._decorator;

@ccclass
export class HighlightResult extends cc.Component {
    @property(cc.Node)
    biden: cc.Node = null;

    @property(cc.Node)
    trump: cc.Node = null;

    protected onLoad(): void {
        this.hide();
    }

    setStatusNode(node: cc.Node, status: boolean) {
        node && (node.active = status);
    }

    hide() {
        this.setStatusNode(this.biden, false);
        this.setStatusNode(this.trump, false);
    }

    show(result: any) {
        const isHead = result?.head;

        this.setStatusNode(this.biden, isHead);
        this.setStatusNode(this.trump, !isHead);
    }
}
