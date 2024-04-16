import { FootballSlotRoundHistory } from "../event-models/FootballSlotRoundHistory";
const { ccclass, property } = cc._decorator;

@ccclass
export default class FootballSlotMiniRoundHistoryItem extends cc.Component {
    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;

    @property(cc.Sprite)
    symbol: cc.Sprite = null;

    @property(cc.Node)
    bigSmall: cc.Node = null;

    @property(cc.Node)
    nextNode: cc.Node = null;

    public setData(data: FootballSlotRoundHistory, isBlink = false) {
        if (data === null) {
            this.symbol.spriteFrame = null;
            this.bigSmall.active = false;
            this.nextNode && (this.nextNode.active = isBlink);
            return;
        }
        const { result, settlementResult } = data;
        const symbol = result.symbols[0] === "cup" ? "cup100" : result.symbols[0];
        this.symbol.spriteFrame = this.atlas.getSpriteFrame(`item_${result.isLucky ? "lucky" : symbol}`);
        const bigSmallColor = settlementResult.big ? "#fe3a0c" : "#00e5ff";
        this.bigSmall.active = true;
        const color = cc.Color.WHITE;
        this.bigSmall.color = color.fromHEX(bigSmallColor);
        this.nextNode && (this.nextNode.active = isBlink);
    }
}
