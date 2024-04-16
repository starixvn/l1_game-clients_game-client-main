import { i18n } from "../../../../../ClientModules";
import GameUtils from "../../../../../common/GameUtils";

const { ccclass, property } = cc._decorator;
@ccclass
export default class FruitSlotTicketDetailResultGroupItem extends cc.Component {
    @property(cc.Label)
    spin: cc.Label = null;

    @property({ type: cc.Sprite })
    symbol: cc.Sprite = null;

    @property(cc.Label)
    bigSmallValueLabel: cc.Label = null;

    @property(cc.Node)
    bigSymbol: cc.Node = null;

    @property(cc.Node)
    smallSymbol: cc.Node = null;

    height: number = null;

    start() {
        GameUtils.setFontSizeLabelsInNode(this.node);
    }

    updateContent(symbolSpriteFrame: cc.SpriteFrame, index: number, bigSmallValue: number) {
        this.symbol.spriteFrame = symbolSpriteFrame;
        this.height = this.node.height;

        if (index === 0) {
            this.updateFirstRowContent(bigSmallValue);
        } else {
            this.node.getChildByName("bigSmall").active = false;
            this.spin.string = i18n.t("fruitSlot.extraSpin");
        }
    }

    private updateFirstRowContent(bigSmallValue: number) {
        this.spin.string = i18n.t("fruitSlot.spinResult");

        this.bigSmallValueLabel.string = bigSmallValue.toString();
        const isBigSymbol = bigSmallValue > 7;
        this.bigSymbol.active = isBigSymbol;
        this.smallSymbol.active = !isBigSymbol;

        this.node.getChildByName("topBorder").active = false;
    }
}
