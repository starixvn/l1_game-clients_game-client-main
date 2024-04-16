import { StringHelper } from "../../../view-models/WinThreeCardsHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class WinThreeCardsBigRoadDot extends cc.Component {
    @property(cc.Node)
    dragon: cc.Node = null;

    @property(cc.Node)
    phoenix: cc.Node = null;

    @property(cc.Node)
    tie: cc.Node = null;

    @property(cc.Node)
    tie1s: cc.Node = null;

    @property(cc.Node)
    count: cc.Node = null;

    @property(cc.Node)
    next: cc.Node = null;

    private readonly listName = ["dragon", "phoenix", "tie", "tie1s", "next"];

    resetNode() {
        this.listName.forEach((name) => {
            this[name].active = false;
        });

        this.count.getComponent(cc.Label).string = StringHelper.Empty;
    }
}
