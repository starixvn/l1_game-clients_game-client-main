import {
    BlockchainBaccaratBetPercentageHandler,
    BlockchainBaccaratCardListHandler,
    BlockchainBaccaratConfigsHandler,
    BlockchainBaccaratFinishHandler,
    BlockchainBaccaratNewBlockchainHandler,
    BlockchainBaccaratRoundHistoryHandler,
} from "../event-handlers/BlockchainBaccaratHandler";
import {
    BlockchainBaccaratCardListModel,
    BlockchainBaccaratConfigsModel,
    BlockchainBaccaratFinishModel,
    BlockchainBaccaratRoundHistoryModel,
} from "../event-models/BlockchainBaccaratModel";
import { GameData } from "./../../_new/_base/game-data-management/models/game-data";
import { BlockchainBaccaratBetPercentageModel } from "./BlockchainBaccaratBetPercentageModel";

const { ccclass } = cc._decorator;

@ccclass
export default class BlockchainBaccaratGameData extends GameData {
    static Events = {
        SETTLED: "settled"
    };

    readonly configs: BlockchainBaccaratConfigsModel;
    readonly cardList: BlockchainBaccaratCardListModel;
    readonly roundHistory: BlockchainBaccaratRoundHistoryModel;
    readonly finishModel: BlockchainBaccaratFinishModel;
    readonly betPercentage: BlockchainBaccaratBetPercentageModel;

    constructor() {
        super();
        this.configs = new BlockchainBaccaratConfigsModel();
        this.cardList = new BlockchainBaccaratCardListModel();
        this.roundHistory = new BlockchainBaccaratRoundHistoryModel();
        this.finishModel = new BlockchainBaccaratFinishModel();
        this.betPercentage = new BlockchainBaccaratBetPercentageModel();
    }

    protected registerEventHandlers() {
        const handlers = [
            BlockchainBaccaratConfigsHandler,
            BlockchainBaccaratCardListHandler,
            BlockchainBaccaratRoundHistoryHandler,
            BlockchainBaccaratFinishHandler,
            BlockchainBaccaratNewBlockchainHandler,
            BlockchainBaccaratBetPercentageHandler
        ];
        this.eventHandlers.push(...handlers.map((Handler) => new Handler(this)));
    }
}
