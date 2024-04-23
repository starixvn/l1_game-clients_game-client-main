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
            this.clearData(isBlink);
            return;
        }
        const { result, settlementResult } = data;
        const symbol = result.symbols[0] === "cup" ? "cup100" : result.symbols[0];
        this.updateSymbolSprite(symbol, result.isLucky);
        this.scaleSymbolX3(result.symbols[0], result.isLucky);
        this.updateBigSmallVisuals(settlementResult.big);
        this.updateNextNodeVisibility(isBlink);
    }

    private clearData(isBlink: boolean) {
        this.symbol.spriteFrame = null;
        this.bigSmall.active = false;
        if (this.nextNode) {
            this.nextNode.active = isBlink;
        }
    }

    private updateSymbolSprite(symbol: string, isLucky: boolean) {
        const spriteFrameKey = `item_${isLucky ? "lucky" : symbol}`;
        this.symbol.spriteFrame = this.atlas.getSpriteFrame(spriteFrameKey);
    }

    private updateBigSmallVisuals(isBig: boolean) {
        const bigSmallColor = isBig ? "#fe3a0c" : "#00e5ff";
        const color = cc.Color.WHITE;
        this.bigSmall.active = true;
        this.bigSmall.color = color.fromHEX(bigSmallColor);
    }
    
    private updateNextNodeVisibility(isBlink: boolean) {
        if (this.nextNode) {
            this.nextNode.active = isBlink;
        }
    }

    private scaleSymbolX3(key: string, isLucky: boolean) {
        this.symbol.node.scale = this.isX3Symbol(key, isLucky) ? 0.55 : 0.5;
    }

    private isX3Symbol(key: string, isLucky: boolean) {
        return key.includes("3") && !isLucky;
    }
}
