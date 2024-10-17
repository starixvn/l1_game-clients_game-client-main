import { i18n } from "../../../../ClientModules";
import GameUtils from "../../../../common/GameUtils";
import { findWinningChoice } from "../FootballCoinTossHelper";

const { ccclass, property } = cc._decorator;
@ccclass
export default class FootballCoinTossDetailResultGroup extends cc.Component {
    @property(cc.Label)
    roundIdLabel: cc.Label = null;

    @property(cc.Label)
    resultText: cc.Label = null;

    @property(cc.Sprite)
    resultImg: cc.Sprite = null;

    @property(cc.SpriteAtlas)
    flagsAtlas: cc.SpriteAtlas = null;

    start() {
        GameUtils.setFontSizeLabelsInNode(this.node);
    }

    createBetLogItem(betLog: any) {
        const { phien, settlementResult } = betLog;
        this.roundIdLabel.string = phien.toString();
        const key = findWinningChoice(settlementResult);
        const teamName = betLog.match[key] ?? key;
        this.resultText.string = i18n.t(`FootballCoinToss.glossary_${teamName}`).toUpperCase();
        this.resultImg.spriteFrame = this.flagsAtlas.getSpriteFrame(`result-${teamName.toLowerCase()}`);
    }
}
