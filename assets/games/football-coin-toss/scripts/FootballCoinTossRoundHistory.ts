import { i18n } from "../../../ClientModules";
import GameBase from "../../_base/GameBase";
import GameBaseFinishHandler from "../../_base/handlers/GameBaseFinishHandler";
import GameLogControlBase from "../../_base/view-models/GameLogControlBase";
import { MatchConfig } from "./FootballCoinTossConstant";
import FootballCoinTossRoundHistoryItem from "./FootballCoinTossRoundHistoryItem";

const { ccclass, property } = cc._decorator;

type result = { home: boolean }[];
@ccclass
export default class FootballCoinTossRoundHistory extends cc.Component {
    @property(GameLogControlBase)
    logControl: GameLogControlBase = null;

    @property(cc.Label)
    away: cc.Label = null;

    @property(cc.Label)
    home: cc.Label = null;

    @property(cc.Label)
    homeLabel: cc.Label = null;

    @property(cc.Label)
    awayLabel: cc.Label = null;

    protected suffix = "%";

    public setData(redData: result) {
        this.updateHistory(redData);
    }

    public init(main: GameBase) {
        const condition = () => {
            const finishHandler = main.finishHandler as GameBaseFinishHandler;
            return (
                main.currentTimeRemaining < main.config.stopBetTime ||
                main.currentTimeRemaining > main.config.fullTime - finishHandler.getResultAnimationTime()
            );
        };
        this.logControl.init(condition);
    }

    private updateHistory(data: result) {
        this.updateStatistic(data);
        if (this.logControl) {
            this.setRoundHistoryItemData(data);
        }
    }

    private setRoundHistoryItemData(data: result) {
        data.reverse();
        const logData = data.map((d) => (d.home ? 1 : 0));
        this.logControl.setData(logData);
        const items = this.logControl.content.getComponentsInChildren(FootballCoinTossRoundHistoryItem);
        items.forEach((item, i) => item.setValue(data[i].home));
    }

    private updateStatistic(redData: result) {
        const total = redData.length;

        if (total === 0) {
            this.updateStatisticLabels({
                awayValue: 0,
                homeValue: 0
            });
            return;
        }

        let head = 0;
        redData.forEach((i) => {
            if (i.home) {
                head++;
            }
        });

        const homeValue = Math.round((head * 100) / total);
        const awayValue = 100 - homeValue;
        this.updateStatisticLabels({ homeValue, awayValue });
    }

    protected updateStatisticLabels({ homeValue, awayValue }) {
        this.home.string = `${homeValue}${this.suffix}`;
        this.away.string = `${awayValue}${this.suffix}`;
    }

    public updateTeamName(match: MatchConfig) {
        if (match && match.home && match.away && this.homeLabel && this.awayLabel) {
            this.homeLabel.string = i18n.t(`FootballCoinToss.glossary_${match.home}`)?.toUpperCase();
            this.awayLabel.string = i18n.t(`FootballCoinToss.glossary_${match.away}`)?.toUpperCase();
        }
    }
}
