import { i18n } from "../../../ClientModules";
import { BaseResultBodyItem } from "../../_base/view-models/provably-fair/GameRoundBasePFVerifyComponent";
import { findWinningChoice } from "./FootballCoinTossHelper";
const { ccclass, property } = cc._decorator;
@ccclass
export default class FootballCoinTossResultBodyItem extends BaseResultBodyItem {
    @property(cc.Label)
    lblResult: cc.Label = null;

    @property(cc.Sprite)
    resultImg: cc.Sprite = null;

    @property(cc.SpriteAtlas)
    flagsAtlas: cc.SpriteAtlas = null;

    setData(result: any, settlementResult: any, match: any) {
        const key = findWinningChoice(settlementResult);
        const teamName = match[key] ?? key;
        this.resultImg.spriteFrame = this.flagsAtlas.getSpriteFrame(teamName.toLowerCase());
        this.lblResult.string = i18n.t(`FootballCoinToss.glossary_${teamName}`).toUpperCase();
    }
}
