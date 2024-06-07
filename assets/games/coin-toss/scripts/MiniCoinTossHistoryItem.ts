import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import SocketIOHistoryItemBase from "../../_base/view-models/SocketIOHistoryItemBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MiniCoinTossHistoryItem extends SocketIOHistoryItemBase {
    @property(cc.Sprite)
    kqSprite: cc.Sprite = null;

    @property(cc.Label)
    kqLabel: cc.Label = null;

    @property(cc.Label)
    odd: cc.Label = null;

    @property(cc.Label)
    even: cc.Label = null;

    @property(cc.Label)
    red3: cc.Label = null;

    @property(cc.Label)
    red4: cc.Label = null;

    @property(cc.Label)
    white3: cc.Label = null;

    @property(cc.Label)
    white4: cc.Label = null;

    @property(cc.SpriteFrame)
    iconRed: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    iconWhite: cc.SpriteFrame = null;

    setData(betLog: any, index: number) {
        const { settlementResult, result } = betLog;

        let number = 0;
        Object.keys(result).forEach((key) => {
            if (result[key]) {
                number++;
            }
        });

        this.kqLabel.string = number.toString();
        if (number % 2) {
            this.kqSprite.spriteFrame = this.iconRed;
            this.kqLabel.node.color = cc.Color.WHITE;
        } else {
            this.kqSprite.spriteFrame = this.iconWhite;
            this.kqLabel.node.color = cc.Color.BLACK;
        }

        Object.keys(settlementResult).forEach((choice) => {
            this[choice].string = numberWithCommas(betLog[choice]);
            if (settlementResult[choice]) {
                this[choice].node.color = cc.Color.YELLOW;
            } else {
                this[choice].node.color = cc.Color.WHITE;
            }
        });
    }
}
