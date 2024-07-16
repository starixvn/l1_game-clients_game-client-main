import { uiManager } from "../../managers/GameUIManager";
import BigWinAnimation from "./BigWinAnimation";

const { ccclass, property } = cc._decorator;

@ccclass
export default class JackpotWinningAmount extends BigWinAnimation {
    @property(cc.Sprite)
    poolSprite: cc.Sprite = null;

    async loadSymbolsAtlas(gameId: number) {
        return uiManager.prefabCache.gameAtlas[gameId];
    }

    async loadPoolSprite(gameId: number, pool: string) {
        const atlas = await this.loadSymbolsAtlas(gameId);
        this.poolSprite.spriteFrame = atlas.getSpriteFrame(`txt-jackpot-game-${pool}`);
    }
}
