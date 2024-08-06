import { getLocale } from "../../common/auth/SessionManager";
import { uiManager } from "../../managers/GameUIManager";
import SlotGameTicketDetail from "./SlotGameTicketDetail";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StandardSlotGameTicketDetail extends SlotGameTicketDetail {
    @property({ type: cc.SpriteAtlas, override: true, visible: false })
    mainAtlas: cc.SpriteAtlas = null;

    @property(cc.SpriteAtlas)
    paylinesAtlas: cc.SpriteAtlas = null;

    @property(cc.Node)
    noWinningPaylinesNode: cc.Node = null;

    private enableJackpot = false;
    gameId: number;

    async setData(data: any) {
        this.enableJackpot = data.enableJackpot;
        super.setData(data);
        this.showNoWinningPaylinesText(data);
    }

    showNoWinningPaylinesText(data) {
        const { settlementResult } = data;

        if (settlementResult.winningPaylines.length > 0 || settlementResult.bonus.odds > 0 || settlementResult.freeSpins.odds > 0) {
            return;
        }

        this.noWinningPaylinesNode.active = true;
    }

    async loadSymbolsAtlas() {
        this.mainAtlas = uiManager.prefabCache.gameAtlas[this.gameId];
    }

    protected getSpriteLine(line: number): cc.SpriteFrame {
        return this.paylinesAtlas.getSpriteFrame(`line-selection-${line + 1}`);
    }

    protected setSymbolFrame(symbolNumber: number) {
        let spriteFrame;
        if (this.enableJackpot && symbolNumber === this.jackpotSymbolNumber) {
            const language = getLocale();
            const suffix = language === "vi-VN" ? `.${language}` : "";
            spriteFrame = this.mainAtlas.getSpriteFrame(`symbol-${symbolNumber}.jackpot${suffix}`);
        } else {
            spriteFrame = this.mainAtlas.getSpriteFrame(`symbol-${symbolNumber}`);
        }

        return spriteFrame;
    }

    protected createFailPaylines(data, winningArray: number[], order: number) {
        // override
    }
}
