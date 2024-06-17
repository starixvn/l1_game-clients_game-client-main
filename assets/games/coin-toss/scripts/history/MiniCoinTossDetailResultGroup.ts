import { i18n } from "../../../../ClientModules";
import GameUtils from "../../../../common/GameUtils";
import { findWinningChoice } from "../MiniCoinTossHelper";

const { ccclass, property } = cc._decorator;
@ccclass
export default class MiniCoinTossDetailResultGroup extends cc.Component {
    @property(cc.Label)
    roundIdLabel: cc.Label = null;

    @property(cc.Label)
    resultText: cc.Label = null;

    @property(cc.Sprite)
    resultImg: cc.Sprite = null;

    start() {
        GameUtils.setFontSizeLabelsInNode(this.node);
    }

    createBetLogItem(betLog: any, symbolsSpriteFrames: cc.SpriteFrame[]) {
        const { phien, settlementResult } = betLog;

        this.roundIdLabel.string = phien.toString();

        const key = findWinningChoice(settlementResult);
        this.resultText.string = i18n.t(`miniCoinToss.${key}`).toUpperCase();
        this.resultImg.spriteFrame = symbolsSpriteFrames.find((sprite) => sprite.name === `result-${key}`);
    }
}
