import BeadRoad from "../../_base/view-models/BeadRoad";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FanTanBeadRoad extends BeadRoad {
    MIN_CONTENT = 342;
    EXTRA_SPACING = 4;

    onLoad() {
        this.initScrollView(this.content.parent.parent.parent);
    }

    reverseDisplayNode(row: number, column: number) {
        return this.rowMax - row - 1; //reverse
    }

    updateContentSize(nodes: cc.Node[]) {
        const columnsCount = Math.ceil(nodes.length / this.rowMax);
        const minColumn = Math.ceil(this.MIN_CONTENT / this.horizontalSpacing);
        this.content.width = columnsCount > minColumn ? columnsCount * this.horizontalSpacing + this.EXTRA_SPACING : this.MIN_CONTENT;
        this.checkScrollViewActivation();
    }

    calculatePosition(row: number, column: number) {
        const anchorX = this.content.anchorX > 0 ? -1 : 1;
        const anchorY = this.content.anchorY > 0 ? -1 : 1;
        const x = anchorX * (this.startHorizontalPadding + column * this.horizontalSpacing);
        const y = anchorY * (this.startVerticalPadding + (this.rowMax - row - 1) * this.verticalSpacing);

        return cc.v3(x, y);
    }

    updatePositions(nodes: cc.Node[]) {
        for (let i = nodes.length - 1; i >= 0; i--) {
            const node = nodes[i];
            const index = nodes.length - 1 - i;
            const column = Math.floor(index / this.rowMax);
            let row = index % this.rowMax;
            row = this.reverseDisplayNode(row, column);
            node.position = this.calculatePosition(row, column);
        }
    }

    addNode(nodes: cc.Node[]) {
        if (this.showNext) {
            if (!this.nextItem) {
                this.nextItem = this.createNextItem();
            }
            nodes.unshift(this.nextItem);
        }
        if (nodes.length > 102) {
            nodes.length = 102;
        }
        return nodes;
    }
}
