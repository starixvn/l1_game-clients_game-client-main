import { lazyInject } from "../../../Application";
import SlotGameTicketDetail from "../../_slotgame_base/SlotGameTicketDetail";
import FourGuardiansConfig from "./FourGuardiansConfig";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FourGuardiansTicketDetail extends SlotGameTicketDetail {
    @property(cc.SpriteAtlas)
    atlasForSC1: cc.SpriteAtlas = null;

    @lazyInject(FourGuardiansConfig)
    private readonly fourGuardiansConfig: FourGuardiansConfig;

    protected getSpriteLine(line: number): cc.SpriteFrame {
        return this.mainAtlas.getSpriteFrame(`dong${line + 1}`);
    }

    protected setSymbolFrame(symbolNumber: number) {
        let jackpotFrame: cc.SpriteFrame = null;

        if (!this.fourGuardiansConfig.jackpotEnabled && symbolNumber === this.jackpotSymbolNumber) {
            jackpotFrame = this.atlasForSC1.getSpriteFrame(`item${this.jackpotSymbolNumber}`);
        } else {
            const lang = window.i18n.curLang;
            let suffix = "";
            if (lang !== "vi") {
                suffix += `_en`;
            }
            let spriteName;
            if (symbolNumber === this.jackpotSymbolNumber) {
                spriteName = `item${symbolNumber}${suffix}`;
            } else {
                spriteName = `item${symbolNumber}`;
            }
            jackpotFrame = this.mainAtlas.getSpriteFrame(spriteName);
        }

        return jackpotFrame;
    }
}
