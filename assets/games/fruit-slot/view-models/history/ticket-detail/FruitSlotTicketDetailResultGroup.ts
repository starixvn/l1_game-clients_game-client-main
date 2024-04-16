import GameUtils from "../../../../../common/GameUtils";
import { BetLog } from "../FruitSlotHistory";
import { getSymbolName } from "../FruitSlotHistoryHelper";
import FruitSlotTicketDetailGroupItem from "./FruitSlotTicketDetailResultGroupItem";

const { ccclass, property } = cc._decorator;
@ccclass
export default class FruitSlotTicketDetailResultGroup extends cc.Component {
    @property(cc.Label)
    roundIdLabel: cc.Label = null;

    @property(cc.Node)
    betChoiceGroupNode: cc.Node = null;

    @property(cc.Prefab)
    betItemPrefab: cc.Prefab = null;

    onLoad() {
        this.betChoiceGroupNode.children.forEach((child) => child.destroy());
    }

    start() {
        GameUtils.setFontSizeLabelsInNode(this.node);
    }

    onDisable() {
        this.betChoiceGroupNode.destroyAllChildren();
    }

    createBetLogItem(betLog: BetLog, symbolsSpriteFrames: cc.SpriteFrame[]) {
        const { result, phien } = betLog;
        const { symbols, number, isLucky } = result;

        this.roundIdLabel.string = phien.toString();

        let height = 0;

        (isLucky ? ["lucky"] : []).concat(symbols).forEach((symbol: string, index: number) => {
            const symbolName = getSymbolName(symbol);
            const symbolSpriteFrame = symbolsSpriteFrames.find((sprite) => sprite.name === `item_${symbolName}`);

            height += this.createTicketDetailItem(symbolSpriteFrame, index, number);
        });

        this.node.height = height;
        this.node.parent.parent.height = height + 48;
    }

    private createTicketDetailItem(symbolSpriteFrame: cc.SpriteFrame, index: number, bigSmallValue: number): number {
        if (!this.betItemPrefab) {
            return 0;
        }

        const betItem = cc.instantiate(this.betItemPrefab);
        const betItemComponent = betItem.getComponent(FruitSlotTicketDetailGroupItem);
        this.betChoiceGroupNode.addChild(betItem);

        betItemComponent.updateContent(symbolSpriteFrame, index, bigSmallValue);

        return betItemComponent.height;
    }
}
