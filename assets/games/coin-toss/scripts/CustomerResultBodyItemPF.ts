import { i18n } from "../../../ClientModules";
import { BaseResultBodyItem } from "../../_base/view-models/provably-fair/GameRoundBasePFVerifyComponent";
import { findWinningChoice } from "./MiniCoinTossHelper";

const { ccclass, property } = cc._decorator;
@ccclass
export default class CustomerResultBodyItemPF extends BaseResultBodyItem {
    @property(cc.Label)
    lblResult: cc.Label = null;

    @property(cc.Sprite)
    resultImg: cc.Sprite = null;

    @property(cc.SpriteFrame)
    symbolSprites: cc.SpriteFrame[] = [];

    setData(result: any, settlementResult: any) {
        const key = findWinningChoice(settlementResult);
        this.resultImg.spriteFrame = this.symbolSprites.find((sprite) => sprite.name === `result-${key}`);
        this.lblResult.string = i18n.t(`CoinToss.glossary_${key}`).toUpperCase();
    }
}
