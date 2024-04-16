import GameUtils from "../../../common/GameUtils";
import TutorialMain from "../../../common/tutorial/TutorialMain";
import { StorageManager } from "../../../managers/StorageManager";
import { payChips } from "../../_base/action/PayChipsAction";
import MD5Component from "../../_base/view-models/MD5Component";
import NewGameRoomBase from "../../_new/_base/NewGameRoomBase";
import * as blockchainAction from "../actions/BlockchainBaccaratActions";
import BlockchainCardList from "../components/card-list/view-models/BlockchainCardList";
import BlockchainCardVerification from "../components/card-list/view-models/BlockchainCardVerification";
import BlockchainBaccaratLastRoundInfo from "../components/last-round-info/view-models/BlockchainBaccaratLastRoundInfo";
import BlockchainBaccaratScoreboard from "../components/score-board/view-models/BlockchainBaccaratScoreBoard";
import { BlockchainBaccaratBetHandler, BlockchainBaccaratTimeHandler } from "../event-handlers/BlockchainBaccaratHandler";
import BlockchainBaccaratGameData from "../event-models/BlockchainBaccaratGameData";
import {
    Blockchain,
    BlockchainBaccaratBetPercentageModel,
    BlockchainBaccaratCardListModel,
    BlockchainBaccaratConfigsModel,
    BlockchainBaccaratFinish,
    BlockchainBaccaratFinishModel,
    BlockchainBaccaratRoundHistory,
    BlockchainBaccaratRoundHistoryModel
} from "../event-models/BlockchainBaccaratModel";
import BlockchainBaccaratBetItem from "./BlockchainBaccaratBetItem";
import BlockchainBaccaratCardsUI from "./BlockchainBaccaratCardsUI";
import { BlockchainBaccaratConfig } from "./BlockchainBaccaratConfig";
import { BlockchainBaccaratEvents, consumeEvent } from "./BlockchainBaccaratEvents";
import BlockchainBetOptionsUI from "./BlockchainBetOptionsUI";

const { ccclass, property } = cc._decorator;
export const BlockchainBaccaratId = 48;
@ccclass
export default class BlockchainBaccarat extends NewGameRoomBase {
    @property({ type: cc.Prefab, visible: false, override: true })
    miniRoundHistoryPrefab: cc.Prefab = null;

    @property({ type: cc.Node, visible: false, override: true })
    miniRoundHistoryContainer: cc.Node = null;

    @property(cc.Prefab)
    cardListPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    cardVerificationPrefab: cc.Prefab = null;

    // hide node on node tree
    @property({ type: MD5Component, override: true, visible: false })
    md5Component: MD5Component = null;

    // hide node on node tree
    @property({ type: MD5Component, override: true, visible: false })
    musicBg: cc.AudioSource = null;

    @property(cc.Prefab)
    flashGuidePrefab: cc.Prefab = null;

    @property(cc.Node)
    containerDeck: cc.Node = null;

    @property(cc.Node)
    chipContainer: cc.Node = null;

    @property(cc.Node)
    ownBetContainer: cc.Node = null;

    @property(cc.Node)
    totalBetContainer: cc.Node = null;

    public gameData: BlockchainBaccaratGameData = null;
    public cardList: BlockchainCardList = null;
    public cardsUI: BlockchainBaccaratCardsUI = null;
    public cardVerification: BlockchainCardVerification = null;
    public betOptionsUI: BlockchainBetOptionsUI = null;
    public scoreboard: BlockchainBaccaratScoreboard = null;
    public lastRoundIfo: BlockchainBaccaratLastRoundInfo = null;
    private readonly durationFlyChip = 1.2;
    private readonly durationAnimWinning = 2.8;
    public config: BlockchainBaccaratConfig;
    public timeHandler: BlockchainBaccaratTimeHandler;
    private isFirstRender = true;

    constructor() {
        super();
        this.gameId = BlockchainBaccaratId;
        this.setConfig(new BlockchainBaccaratConfig());
    }

    onLoad() {
        this.gameData = new BlockchainBaccaratGameData();
        super.onLoad();
        this.registerRoundHistoryEvents();
        this.registerGameConfigEvents();
        this.registerBetPercentageEvents();
        this.registerCardListEvents();
        this.initCardList();
        this.initCardVerification();
        this.registerFinishEvents();
        this.registerNewBlockchainEvents();
        this.registerBlockchainEvents();
        this.registerCardVerification();
        this.isFirstRender = true;
    }

    resetDataAndUI() {
        super.resetDataAndUI();
        this.cardsUI?.winningNotice && (this.cardsUI.winningNotice.node.parent.active = false);
    }

    private initCardList() {
        const dialog = cc.instantiate(this.cardListPrefab);
        this.cardList = dialog.getComponent(BlockchainCardList);
        this.cardList.init(this);
        this.cardList.node.active = false;
        this.currentMiniPanel.addDialog(dialog);
    }

    private initCardVerification() {
        const cardVerificationNode = cc.instantiate(this.cardVerificationPrefab);
        this.cardVerification = cardVerificationNode.getComponent(BlockchainCardVerification);
        this.cardVerification.node.active = false;
        this.currentMiniPanel.addDialog(cardVerificationNode);
    }

    private initBetOptionsUI(node: cc.Node) {
        this.betOptionsUI = node.getComponent(BlockchainBetOptionsUI);
        this.betOptionsUI.initBetOptions(this);

        this.betItems?.forEach((item) => {
            GameUtils.moveToOtherNode(item.chipNode, this.chipContainer);
            GameUtils.moveToOtherNode(item.totalBet.node, this.totalBetContainer);
            GameUtils.moveToOtherNode(item.ownBet.node, this.ownBetContainer);
        });
    }

    private initScoreBoardUI(node: cc.Node) {
        this.scoreboard = node.getComponent(BlockchainBaccaratScoreboard);
    }

    private initLastRoundInfo(node: cc.Node) {
        this.lastRoundIfo = node.getComponent(BlockchainBaccaratLastRoundInfo);
    }

    private initCardsUI(node: cc.Node) {
        this.cardsUI = node.getComponent(BlockchainBaccaratCardsUI);
        GameUtils.moveToOtherNode(this.cardsUI.cardDeck, this.containerDeck);
    }

    initFlashGuide() {
        const storageKey = "blockchain_baccarat_flash_guide";
        const data = StorageManager.get(storageKey) ?? {
            enabled: true
        };
        if (!data.enabled || !this.flashGuidePrefab) {
            return;
        }
        this.openFlashGuide();
    }

    openFlashGuide() {
        this.playClick();
        const storageKey = "blockchain_baccarat_flash_guide";
        const node = cc.instantiate(this.flashGuidePrefab);
        this.currentMiniPanel.addDialog(node);
        const tutorialMain = node.getComponent(TutorialMain);
        tutorialMain.setTimeConfig([]);
        tutorialMain.endSlideCallBack = () => {
            StorageManager.set(storageKey, { enabled: false });
        };
        tutorialMain.show();
    }

    private openCardList() {
        this.playClick();
        this.cardList.node.active = true;
        this.cardList.updateBlockchain(this.gameData.cardList.blockchain);
        this.cardList.setData();
        this.cardList.showDialog();
    }

    initHandlers() {
        super.initHandlers();
        this.timeHandler = new BlockchainBaccaratTimeHandler(this);
        this.betHandler = new BlockchainBaccaratBetHandler(this);
    }

    private checkShowCards() {
        if (this.gameData.cardList.blockchain.isNew && this.timeHandler.isInWaitTime) {
            return this.timeHandler.checkShowAllCards(this.currentTimeRemaining);
        } else {
            return true;
        }
    }

    private registerCardListEvents() {
        this.gameData.cardList.on(BlockchainBaccaratCardListModel.Events.UPDATE_CURRENT_INDEX, (currentIndex: number) => {
            if (this.checkShowCards()) {
                this.cardsUI?.setActiveCardsUI(true);
                this.cardsUI.handleNumberIndex(currentIndex);
            }
            if (this.isFirstRender) {
                this.isFirstRender = false;
                this.initFlashGuide();
                blockchainAction.updateCardDropBox(this.cardsUI)(currentIndex, this.gameData.cardList.blockchain.cutCardIndex);
            }
        });
    }

    private registerBetPercentageEvents() {
        this.gameData.betPercentage.on(BlockchainBaccaratBetPercentageModel.Events.CHANGE, (percentageBet) => {
            blockchainAction.handlePercentBet(this.betItems as BlockchainBaccaratBetItem[])(percentageBet);
        });
    }

    private registerGameConfigEvents() {
        this.gameData.configs.on(BlockchainBaccaratConfigsModel.Events.CHANGE, blockchainAction.updateGameConfigs(this));
    }

    private registerRoundHistoryEvents() {
        this.gameData.roundHistory.on(
            BlockchainBaccaratRoundHistoryModel.Events.CHANGE,
            (roundHistory: BlockchainBaccaratRoundHistory[]) => {
                blockchainAction.updateWinning(
                    this.betOptionsUI,
                    this.cardsUI,
                    this.timeHandler,
                    this.gameData.cardList
                )(roundHistory, this.gameData.cardList.currentIndex);
                blockchainAction.updateLastRoundInfo(this.timeHandler, this.lastRoundIfo)(
                    roundHistory,
                    this.gameData.cardList.currentIndex
                );
                blockchainAction.renderScoreboard(this.scoreboard)(roundHistory);
            }
        );
    }

    private registerFinishEvents() {
        this.gameData.finishModel.on(BlockchainBaccaratFinishModel.Events.CHANGE_SETTLEMENT, (finishData: BlockchainBaccaratFinish) => {
            this.gameData.cardList.calculateCardsFly(finishData.blockchain.currentIndex);
            this.cardsUI.isRunSettle = true;
            !this.cardsUI.isRunJoinRoom &&
                blockchainAction.openCards(this.cardsUI)(finishData, () => {
                    //show winning
                    blockchainAction.showLabelWinning(this.betOptionsUI, this.cardsUI)(finishData.settlementResult);
                    blockchainAction.showHighLightBet(this.betOptionsUI)(finishData.settlementResult);
                    this.scoreboard.renderScoreBoardEachRound(finishData);
                    blockchainAction.renderCardSettlement(this.cardList)(finishData);
                    payChips(this, finishData.settlementResult, finishData.winningPlayers, this.durationFlyChip, this.durationAnimWinning);
                    this.gameData.cardList.change(finishData?.blockchain);
                    this.finishShowResult = true;
                });
            this.cardsUI.isRunJoinRoom = false;
        });
    }

    private registerNewBlockchainEvents() {
        this.gameData.cardList.on(BlockchainBaccaratCardListModel.Events.UPDATE_NEW_BLOCKCHAIN, (newBlockchain: Blockchain) => {
            blockchainAction.updateBlockchainCardList(this.cardList)(newBlockchain);
            this.gameData.cardList.currentIndex = newBlockchain.currentIndex;
            this.gameData.cardList.numberCardsFly = 6;
        });
    }

    private registerBlockchainEvents() {
        this.gameData.cardList.on(BlockchainBaccaratCardListModel.Events.CHANGE, (blockchain: Blockchain) => {
            this.cardList.updateBlockchain(blockchain);
        });
    }

    private registerCardVerification() {
        consumeEvent(BlockchainBaccaratEvents.CHANGE_CARD, (params) => {
            blockchainAction.highLightCardSelected(this.cardList)(params["index"], this.openCardList.bind(this));
        });

        consumeEvent(BlockchainBaccaratEvents.OPEN_VERIFICATION, (params) => {
            const index = params["index"];
            this.cardList.initCardVerification(this.gameData.cardList.mainBlockChain.chain[index], index);
        });

        consumeEvent(BlockchainBaccaratEvents.RESET_CARD_SELECTED, () => {
            this.cardList.resetHighLightCurrentCardSelected();
        });

        consumeEvent(BlockchainBaccaratEvents.FLIPPED_CARD, (params) => {
            blockchainAction.renderCardVerification(
                this.cardVerification,
                this.gameData.finishModel.finishData?.blockchain
            )(params["index"]);
        });

        consumeEvent(BlockchainBaccaratEvents.OPENED_CARD, (params) => {
            blockchainAction.updateMainBlockchain(this.gameData.cardList)(
                this.gameData.finishModel.finishData?.blockchain,
                params["index"]
            );
        });
    }

    handleShowGameId(status: boolean) {
        this.gameRound.node.active = status;
    }
}
