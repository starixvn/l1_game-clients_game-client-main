const { ccclass, property } = cc._decorator;

@ccclass
export class FootballHighlightResult extends cc.Component {
    @property(cc.Node)
    home: cc.Node = null;

    @property(cc.Node)
    away: cc.Node = null;

    protected onLoad(): void {
        this.hide();
    }

    setStatusNode(node: cc.Node, status: boolean) {
        node && (node.active = status);
    }

    hide() {
        this.setStatusNode(this.home, false);
        this.setStatusNode(this.away, false);
    }

    show(result: any) {
        const isHead = result?.home;

        this.setStatusNode(this.home, isHead);
        this.setStatusNode(this.away, !isHead);
    }
}
