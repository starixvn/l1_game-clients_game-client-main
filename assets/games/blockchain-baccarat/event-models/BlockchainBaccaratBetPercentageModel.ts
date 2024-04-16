import EventEmitterBase from "../../../common/emitter/EventEmitterBase";

export type BlockchainBaccaratBetType = {
    banker?: number;
    player?: number;
    tie?: number;
};

export class BlockchainBaccaratBetPercentageModel extends EventEmitterBase {
    static Events = {
        CHANGE: "betPercentage:change"
    };

    betPercentage: BlockchainBaccaratBetType;

    change(betPercentage: BlockchainBaccaratBetType) {
        this.betPercentage = betPercentage;
        this.emit(BlockchainBaccaratBetPercentageModel.Events.CHANGE, this.betPercentage);
    }
}
