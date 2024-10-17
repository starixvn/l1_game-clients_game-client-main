import { i18n } from "../../../ClientModules";
import BetItem from "../../_base/view-models/BetItem";
import { MatchConfig } from "./FootballCoinTossConstant";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FootballCoinTossBetItem extends BetItem {
    @property(cc.Node)
    normalIcon: cc.Node = null;

    @property(cc.Node)
    loseIcon: cc.Node = null;

    @property(cc.Sprite)
    flag: cc.Sprite = null;

    @property(cc.SpriteAtlas)
    flagsAtlas: cc.SpriteAtlas = null;

    @property(cc.Label)
    lblTeamName: cc.Label = null;

    public setTeam(match: MatchConfig) {
        if (match?.home && match?.away) {
            const teamType = this.node.name;
            const teamCode = match[teamType];
            this.lblTeamName.string = this.getTeamName(teamCode);
            this.loadFlag(teamCode, teamType);
        }
    }

    getTeamName(teamCode: string) {
        const teamTypeText = i18n.t(`FootballCoinToss.glossary_${teamCode.toUpperCase()}`);
        if (teamTypeText.includes("FootballCoinToss.glossary_")) {
            return "";
        }

        return teamTypeText.toUpperCase();
    }

    loadFlag(teamCode: string, teamType: string) {
        const spriteFrame = this.flagsAtlas.getSpriteFrame(teamCode.toLowerCase());
        this.flag.spriteFrame = spriteFrame ?? this.flagsAtlas.getSpriteFrame(teamType);
    }

    public setHighlight(highlight: boolean, isAnimated = true) {
        super.setHighlight(highlight, isAnimated);

        if (this.highlightBorder) {
            this.highlightBorder.active = highlight && !isAnimated;
        }
    }

    public handleHighlightAnim(isActive: boolean) {
        this.loseIcon && (this.loseIcon.active = isActive);
        this.odds.node.opacity = isActive ? 150 : 255;
    }
}
