import { i18n } from "../../../ClientModules";
import { findWinningChoice } from "./FootballCoinTossHelper";
const { ccclass, property } = cc._decorator;
@ccclass
export default class FootballCoinTossResultBodyItem extends cc.Component {
    @property(cc.Label)
    lblResult: cc.Label = null;

    @property(cc.Sprite)
    resultImg: cc.Sprite = null;

    @property(cc.SpriteAtlas)
    flagsAtlas: cc.SpriteAtlas = null;

    setData(settlementResult: any, match: any) {
        const key = findWinningChoice(settlementResult);
        const teamName = match[key] ?? key;
        this.resultImg.spriteFrame = this.flagsAtlas.getSpriteFrame(`result-${teamName.toLowerCase()}`);
        this.lblResult.string = i18n.t(`FootballCoinToss.glossary_${teamName}`).toUpperCase();
    }
}
