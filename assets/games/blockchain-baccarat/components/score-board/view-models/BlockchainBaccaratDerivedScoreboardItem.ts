import { DerivedScoreboardPoint } from "sc-scoreboards";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BlockchainBaccaratDerivedScoreboardItem extends cc.Component {
    @property([cc.Node])
    nodes: cc.Node[] = [];

    protected readonly NodeItems = {
        RED: "red",
        BLUE: "blue",
        NEXT: "next"
    };
    private hasValueArray: boolean[] = [];

    onLoad(): void {
        this.hasValueArray = this.nodes.map(() => false);
    }

    resetNode(point: DerivedScoreboardPoint) {
        const gap = point.column % 2 === 0 ? 0 : 6;
        const node = this.nodes[point.row + gap];
        for (const name in this.NodeItems) {
            node.getChildByName(this.NodeItems[name]).active = false;
        }
        this.hasValueArray[point.row + gap] = false;
    }

    renderNode(point: DerivedScoreboardPoint) {
        const gap = point.column % 2 === 0 ? 0 : 6;
        const node = this.nodes[point.row + gap];
        node.getChildByName(this.NodeItems.RED).active = point.status;
        node.getChildByName(this.NodeItems.BLUE).active = !point.status;
        node.getChildByName(this.NodeItems.NEXT).active = false;
        this.hasValueArray[point.row + gap] = true;
    }

    resetAll() {
        for (const node of this.nodes) {
            for (const name in this.NodeItems) {
                node.getChildByName(this.NodeItems[name]).active = false;
            }
        }
        this.hasValueArray = this.nodes.map(() => false);
    }

    renderNextNode() {
        if (this.hasValueArray[6]) {
            for (let index = this.hasValueArray.length - 2; index >= 0; index--) {
                if (this.hasValueArray[index]) {
                    const node = this.nodes[index + 1];
                    node.getChildByName(this.NodeItems.NEXT).active = true;
                    return;
                }
            }
        } else {
            for (let index = 0; index < this.hasValueArray.length; index++) {
                if (!this.hasValueArray[index]) {
                    const node = this.nodes[index];
                    node.getChildByName(this.NodeItems.NEXT).active = true;
                    return;
                }
            }
        }

        this.nodes[0].getChildByName(this.NodeItems.NEXT).active = true;
    }

    removeNextNode() {
        this.nodes.forEach((node) => {
            node.getChildByName(this.NodeItems.NEXT).active = false;
        });
    }

    isFilledColumn() {
        for (let index = 6; index < this.hasValueArray.length; index++) {
            if (!this.hasValueArray[index]) {
                return false;
            }
        }
        return true;
    }
}
