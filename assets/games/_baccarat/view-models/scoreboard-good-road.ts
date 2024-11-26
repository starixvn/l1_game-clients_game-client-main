import { GoodRoad } from "sc-scoreboards";

const { ccclass, property } = cc._decorator;

@ccclass
export class ScoreboardGoodRoad extends cc.Component {
    @property
    protected itemSize = 0;

    render(goodRoad: GoodRoad) {
        if (!goodRoad) {
            this.setVisible(false);
            return;
        }

        this.setVisible(true);
        const { x, width } = goodRoad;
        const positionX = this.itemSize * x;
        const calculateWidth = this.itemSize * width;

        this.node.position = cc.v3(positionX, 0);
        this.node.width = calculateWidth;
    }

    setVisible(visible: boolean) {
        this.node.active = visible;
    }
}
