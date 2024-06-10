import MiniRoundHistoryItem from "../../../common/mini-round-history/MiniRoundHistoryItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MiniCoinTossLedLightItem extends MiniRoundHistoryItem {
    @property(cc.Sprite)
    icon: cc.Sprite = null;

    @property(cc.SpriteFrame)
    dotRed: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    dotBlue: cc.SpriteFrame = null;

    public setData(data: any) {
        this.data = data;
        const { settlementResult } = data;
        this.icon.spriteFrame = settlementResult.head ? this.dotBlue : this.dotRed;
    }
}
