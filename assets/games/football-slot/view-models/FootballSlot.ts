import GameUtils from "../../../common/GameUtils";
import { RoundHistory } from "../../_base_new/models/RoundHistory";
import { Settlement } from "../../_base_new/models/Settlement";
import NewGameRoomBase from "../../_new/_base/NewGameRoomBase";
import SlotGameSongs from "../../_slotgame_base/SlotGameSongs";
import { FootballSlotFinishModel, handleAfterSettlementResult, handleShowResult } from "../actions/FootballSlotFinishActions";
import { FootballSlotBetHandler } from "../event-handlers/FootballSlotBetHandler";
import FootballSlotTimeHandler from "../event-handlers/FootballSlotTimeHandler";
import FootballGameData from "../event-models/FootballGameData";
import { FootballSlotRoundHistory } from "../event-models/FootballSlotRoundHistory";
import { CountdownAnimationType } from "../FootballSlotType";
import FootballSlotAnimatedTimer from "./FootballSlotAnimatedTimer";
import FootballSlotBetItem from "./FootballSlotBetItem";
import FootballSlotBetOptionsUI from "./FootballSlotBetOptionsUI";
import { FootballSlotConfig } from "./FootballSlotConfig";
import FootballSlotMiniRoundHistory from "./FootballSlotMiniRoundHistory";
import FootballSlotSpinItem from "./FootballSlotSpinItem";
import FootballSlotStatistic from "./FootballSlotStatistic";

const { ccclass, property } = cc._decorator;
export const FootballSlotGameId = 79;

@ccclass
export default class FootballSlot extends NewGameRoomBase {
    @property(cc.Prefab)
    statisticPrefab: cc.Prefab = null;

    @property(cc.Node)
    ownBetContainer: cc.Node = null;

    @property(cc.Node)
    chipContainer: cc.Node = null;

    @property(cc.Node)
    totalBetContainer: cc.Node = null;

    @property(cc.Node)
    timeShowResult: cc.Node = null;

    @property(cc.SpriteFrame)
    shadowChip: cc.SpriteFrame = null;

    @property({ type: [cc.Component] })
    protected bettingAreas: FootballSlotBetItem[] = [];

    @property({ type: FootballSlotSpinItem })
    spinItems: FootballSlotSpinItem[] = [];

    @property(sp.Skeleton)
    animCountdownSkeleton: sp.Skeleton[] = [];

    @property(cc.Node)
    countdownLight: cc.Node = null;

    @property(SlotGameSongs)
    gameSongList: SlotGameSongs = null;

    public gameData: FootballGameData = null;
    public config: FootballSlotConfig;
    public betOptionsUI: FootballSlotBetOptionsUI = null;
    public miniRoundHistory: FootballSlotMiniRoundHistory = null;
    public statistic: FootballSlotStatistic = null;
    public timeHandler: FootballSlotTimeHandler;
    public animatedTime: FootballSlotAnimatedTimer = null;
    public isShowAnimSettlement = false;

    currentBetChoices: any = {};
    betChoicesStack = [];
    tempBetChoices: any = {};

    startRoundDuration = 1;
    showResultDuration = 3;

    previousRoundBetChoices: any = {};

    songListConfig = {
        SC1: ["BGm1", "BGm2", "BGm3"],
        SC2: ["BGm1", "BGm2", "BGm3"]
    };
    constructor() {
        super();
        this.gameId = FootballSlotGameId;
        this.setConfig(new FootballSlotConfig());
    }

    onLoad() {
        this.gameData = new FootballGameData();
        super.onLoad();
        this.initStatistic();
        this.registerRoundHistoryEvents();
        this.registerSettlementEvents();
        this.initGameSongList();
    }

    protected initGameSongList() {
        if (this.gameSongList) {
            this.gameSongList.gameId = this.gameId;
            this.songListConfig && this.gameSongList.setListSongs(this.songListConfig);
        }
    }

    async playInvidiualMusic() {
        this.gameSongList ? await this.gameSongList?.play() : await super.playInvidiualMusic();
    }

    stopInvidiualMusic() {
        this.gameSongList?.stop();
        super.stopInvidiualMusic();
    }

    resetDataAndUI() {
        super.resetDataAndUI();
    }

    openStatistic() {
        this.playClick();
        this.statistic.node.active = true;
        this.statistic.commonDialog.showDialog();
    }

    initHandlers() {
        super.initHandlers();
        this.timeHandler = new FootballSlotTimeHandler(this);
        this.betHandler = new FootballSlotBetHandler(this);
    }

    private registerRoundHistoryEvents() {
        this.gameData.roundHistory.on(RoundHistory.Events.CHANGE, (roundHistory: FootballSlotRoundHistory[]) => {
            this.miniRoundHistory?.render(roundHistory);
            this.statistic?.render(roundHistory);
        });
    }

    private registerSettlementEvents() {
        this.gameData.settlement.on(Settlement.Events.SHOW_RESULT, (finish: FootballSlotFinishModel) => {
            handleShowResult(this)(finish);
            this.updateShowAnimSettlementStatus(true);
        });
        this.gameData.settlement.on(Settlement.Events.END_SHOW_RESULT, ({ settlement }: { settlement: FootballSlotFinishModel }) => {
            handleAfterSettlementResult(this)(settlement);
        });
    }

    private initBetOptionsUI(node: cc.Node) {
        this.betOptionsUI = node.getComponent(FootballSlotBetOptionsUI);
        this.betOptionsUI.initBetOptions(this);

        this.betItems?.forEach((item) => {
            GameUtils.moveToOtherNode(item.totalBet.node, this.totalBetContainer);
            GameUtils.moveToOtherNode(item.ownBet.node, this.ownBetContainer);
            GameUtils.moveToOtherNode(item.chipNode, this.chipContainer);
        });
    }

    private initMiniRoundHistory(node: cc.Node) {
        this.miniRoundHistory = node.getComponent(FootballSlotMiniRoundHistory);
        this.miniRoundHistory.init(this);
    }

    private initStatistic() {
        const statisticNode = cc.instantiate(this.statisticPrefab);
        this.statistic = statisticNode.getComponent(FootballSlotStatistic);
        this.statistic.node.active = false;
        this.statistic.initMiniRoundHistory();
        this.currentMiniPanel.addDialog(statisticNode);
    }

    timeAnimShowResult(show: boolean) {
        this.timeShowResult.active = show;
    }

    stopCountDownAnim(stop: boolean) {
        const anim = stop ? CountdownAnimationType.IDLE : CountdownAnimationType.PLAY;
        for (const animSymbol of this.animCountdownSkeleton) {
            animSymbol.setAnimation(0, anim, true);
        }
    }

    countdownLightAnim(isAnimated: boolean) {
        if (this.countdownLight) {
            this.countdownLight.active = isAnimated;
        }
    }

    updateShowAnimSettlementStatus(status = false) {
        this.isShowAnimSettlement = status;
    }
}
