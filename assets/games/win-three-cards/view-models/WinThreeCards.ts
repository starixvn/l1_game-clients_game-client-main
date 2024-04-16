import { i18n } from "../../../ClientModules";
import GameUtils from "../../../common/GameUtils";
import AudioManager from "../../../common/audio/AudioManager";
import GameRoomBaseBetHandler from "../../_base/handlers/GameRoomBaseBetHandler";
import NewGameRoomBase from "../../_new/_base/NewGameRoomBase";
import WinThreeCardsBasicHistoryBoard from "../components/score-board/view-models/WinThreeCardsBasicHistoryBoard";
import WinThreeCardsScoreBoard from "../components/score-board/view-models/WinThreeCardsScoreBoard";
import WinThreeCardBetItem from "./WinThreeCardBetItem";
import { WinThreeCardsConfigs, hedgeBetChoices } from "./WinThreeCardsConstant";
import { StringHelper } from "./WinThreeCardsHelper";
import WinThreeCardsItem from "./WinThreeCardsItem";
import WinThreeCardsBetPercentHandler from "./data-handlers/WinThreeCardsBetPercentHandler";
import WinThreeCardsFinishHandler from "./data-handlers/WinThreeCardsFinishHandler";
import WinThreeCardsLogsHandler from "./data-handlers/WinThreeCardsLogsHandler";
import WinThreeCardsTimeDataHandler from "./data-handlers/WinThreeCardsTimeDataHandler";
import WinThreeCardsHistory from "./history/WinThreeCardsHistory";
const { ccclass, property } = cc._decorator;

export const WinThreeCardsId = 61;
@ccclass
export default class WinThreeCards extends NewGameRoomBase {
    @property({ type: WinThreeCardBetItem, override: true })
    betItems: WinThreeCardBetItem[] = [];

    @property({ type: WinThreeCardsItem })
    phoenixCards: WinThreeCardsItem = null;

    @property({ type: WinThreeCardsItem })
    dragonCards: WinThreeCardsItem = null;

    @property(cc.Node)
    basicHistoryBoardNode: cc.Node = null;

    @property(cc.Prefab)
    basicHistoryBoardPrefab: cc.Prefab = null;

    @property(cc.Node)
    bigRoadNode: cc.Node = null;

    @property(cc.Prefab)
    bigRoadPrefab: cc.Prefab = null;

    @property(cc.Label)
    winNoticeLabel: cc.Label = null;

    @property(cc.AudioSource)
    getCardAudioSource: cc.AudioSource = null;

    @property(cc.Node)
    cardDropBox: cc.Node = null;

    @property({ type: cc.AudioSource, visible: false, override: true })
    musicBg: cc.AudioSource = null;

    public basicHistoryBoard: WinThreeCardsBasicHistoryBoard;
    public showScoreBoardNextDot = false;
    public scoreboard: WinThreeCardsScoreBoard = null;
    public logsHandler: WinThreeCardsLogsHandler;
    public timeHandler: WinThreeCardsTimeDataHandler;
    public betPercentHandler: WinThreeCardsBetPercentHandler;
    override syncShowingMD5WithResult = true;

    constructor() {
        super();
        this.gameId = WinThreeCardsId;
        this.setConfig(new WinThreeCardsConfigs());
    }

    onLoad() {
        super.onLoad();
        this.initCards();
        this.initBasicScoreboard();
    }

    resetDataAndUI() {
        super.resetDataAndUI();
        this.highlightLastResult();

        this.winNoticeLabel.node.parent.active = false;
    }

    setUpHandlers() {
        super.setUpHandlers();

        this.betPercentHandler = new WinThreeCardsBetPercentHandler(this);
        super.addHandlers(this.betPercentHandler);
    }

    initHandlers() {
        super.initHandlers();
        this.timeHandler = new WinThreeCardsTimeDataHandler(this);
        this.finishHandler = new WinThreeCardsFinishHandler(this);
        this.logsHandler = new WinThreeCardsLogsHandler(this);
        this.betHandler = new GameRoomBaseBetHandler(this);
    }

    private initScoreBoard(node: cc.Node) {
        this.scoreboard = node.getComponent(WinThreeCardsScoreBoard);
    }

    openHistory() {
        this.playClick();
        const dialog = cc.instantiate(this.historyPrefab);
        this.historyComponent = dialog.getComponent(WinThreeCardsHistory);
        this.historyComponent.init(this.socket);
        this.currentMiniPanel.node.addChild(dialog);
    }

    private playGetCardAudio() {
        AudioManager.getInstance().playSFX(this.getCardAudioSource.clip);
    }

    private initCards() {
        this.dragonCards.init(() => {
            this.playGetCardAudio();
        });
        this.phoenixCards.init(() => {
            this.playGetCardAudio();
        });
    }

    private initBasicScoreboard() {
        const condition = () => {
            return this.currentTimeRemaining < this.config.stopBetTime || this.showScoreBoardNextDot;
        };

        const historyBoardNode = cc.instantiate(this.basicHistoryBoardPrefab);
        this.basicHistoryBoard = historyBoardNode.getComponent(WinThreeCardsBasicHistoryBoard);
        this.basicHistoryBoard.init(condition);
        this.basicHistoryBoardNode.addChild(historyBoardNode);
    }

    private highlightLastResult() {
        if (this.currentTimeRemaining <= this.config.stopBetTime) {
            return;
        }

        const dataLog = this.currentDataLogs[0];
        if (dataLog) {
            this.betItems.forEach((betItem) => {
                betItem.setHighlight(dataLog.settlementResult[betItem.node.name], false);
            });
        }
    }

    getBetChoiceString(choice: string): string {
        if (hedgeBetChoices.includes(choice.toLowerCase())) {
            return i18n.t(`${StringHelper.winThreeCardsNameSpace}.${choice}`);
        }

        return GameUtils.getBetChoiceString(choice);
    }
}
