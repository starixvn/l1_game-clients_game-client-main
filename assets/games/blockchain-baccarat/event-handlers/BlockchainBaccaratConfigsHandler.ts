import { BCBaccaratMaxBetPerChoices, BlockchainBaccaratOdds } from "../event-models/BlockchainBaccaratConfigsModel";
import BlockchainBaccaratGameData from "../event-models/BlockchainBaccaratGameData";
import { BaseEventHandler } from "./../../_new/_base/game-data-management/event-handlers/base-handler";
import { BlockchainBaccaratConfigData } from "./../event-models/BlockchainBaccaratConfigsModel";

export type BlockchainBaccaratConfigType = {
    gameConfigs: {
        chips: string[];
        enableFreeBet: boolean;
        groupId: number;
        maxBet: number;
        minBet: number;
        maxBetPerChoices: BCBaccaratMaxBetPerChoices;
        odds: BlockchainBaccaratOdds;
        stakeLevels: string[];
        _id: string;
    };
};

export class BlockchainBaccaratConfigsHandler extends BaseEventHandler<BlockchainBaccaratConfigType> {
    protected readonly gameData: BlockchainBaccaratGameData;

    protected verifyEvent(event: BlockchainBaccaratConfigType) {
        return event.gameConfigs != null;
    }

    protected handle(event: BlockchainBaccaratConfigType) {
        this.gameData.configs.change(event.gameConfigs as BlockchainBaccaratConfigData);
    }
}
