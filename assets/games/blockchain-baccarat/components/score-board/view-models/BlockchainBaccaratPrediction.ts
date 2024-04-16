const { ccclass, property } = cc._decorator;

@ccclass
export class BlockchainBaccaratPrediction extends cc.Component {
    @property(cc.Node)
    banker: cc.Node = null;

    @property(cc.Node)
    player: cc.Node = null;

    private readonly itemKey = {
        bigEyeBoyItem: "bigEyeBoyItem",
        smallRoadItem: "smallRoadItem",
        cockroachPigItem: "cockroachPigItem"
    };

    private readonly itemValueKey = { red: "red", blue: "blue" };

    resetItem() {
        for (const childName in this.itemKey) {
            this.banker.getChildByName(childName).getChildByName(this.itemValueKey.red).active = false;
            this.banker.getChildByName(childName).getChildByName(this.itemValueKey.blue).active = false;
            this.player.getChildByName(childName).getChildByName(this.itemValueKey.red).active = false;
            this.player.getChildByName(childName).getChildByName(this.itemValueKey.blue).active = false;
        }
    }

    setBanker(data: boolean[]) {
        for (let index = 0; index < data.length; index++) {
            this.setData(index, this.banker, data[index]);
        }
    }

    setPlayer(data: boolean[]) {
        for (let index = 0; index < data.length; index++) {
            this.setData(index, this.player, data[index]);
        }
    }

    private setData(index: number, node: cc.Node, isRed: boolean) {
        node.children[index].getChildByName(this.itemValueKey.red).active = isRed === undefined ? false : isRed;
        node.children[index].getChildByName(this.itemValueKey.blue).active = isRed === undefined ? false : !isRed;
    }
}
