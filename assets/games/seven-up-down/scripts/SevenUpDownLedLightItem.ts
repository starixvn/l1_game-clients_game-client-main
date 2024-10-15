import MiniRoundHistoryItem from "../../../common/mini-round-history/MiniRoundHistoryItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SevenUpDownLedLightItem extends MiniRoundHistoryItem {
    @property(cc.Sprite)
    icon: cc.Sprite = null;

    @property(cc.SpriteAtlas)
    mainAtlas: cc.SpriteAtlas = null;

    public setData(data: any) {
        this.data = data;
        const { settlementResult } = data;
        const choiceWin = settlementResult.find((choice) => settlementResult[choice]);
        this.icon.spriteFrame = this.mainAtlas.getSpriteFrame(`statistic-${choiceWin}`);
    }
}
