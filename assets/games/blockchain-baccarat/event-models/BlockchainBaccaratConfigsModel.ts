import { GameConfigBase } from "./../../_base/view-models/GameConfigBase";
import EventEmitterBase from "../../../common/emitter/EventEmitterBase";

export type BCBaccaratMaxBetPerChoices = {
    banker: number;
    bankerPair: number;
    big: number;
    player: number;
    playerPair: number;
    small: number;
    tie: number;
};

export type BlockchainBaccaratOdds = {
    banker: number;
    bankerPair: number;
    big: number;
    player: number;
    playerPair: number;
    small: number;
    tie: number;
};

export type BlockchainBaccaratConfigData = {
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

export interface BlockchainConfig extends GameConfigBase {
    readonly fullTimeNewShoe: number;
}

export class BlockchainBaccaratConfigsModel extends EventEmitterBase {
    static Events = {
        CHANGE: "configs:change"
    };

    gameConfigs: BlockchainBaccaratConfigData;

    change(configs: BlockchainBaccaratConfigData) {
        this.gameConfigs = configs;
        this.emit(BlockchainBaccaratConfigsModel.Events.CHANGE, configs);
    }
}
