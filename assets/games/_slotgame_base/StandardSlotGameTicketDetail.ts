import { getLocale } from "../../common/auth/SessionManager";
import { SystemType } from "../../ISystem";
import { uiManager } from "../../managers/GameUIManager";
import SlotGameTicketDetail from "./SlotGameTicketDetail";
import configs = require("../../configs/Configs");

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
        if (symbolNumber === this.jackpotSymbolNumber && configs.systemType === SystemType.SC2) {
            const language = getLocale();
            const suffix = language === "vi-VN" ? `.${language}` : "";
            const spriteFrame = this.mainAtlas.getSpriteFrame(`symbol-${symbolNumber}.jackpot${suffix}`);
            return spriteFrame;
        }

        return this.mainAtlas.getSpriteFrame(`symbol-${symbolNumber}`);
    }

    protected createFailPaylines(data, winningArray: number[], order: number) {
        // override
    }
}
