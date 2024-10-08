import { BlockchainConfig } from "./../event-models/BlockchainBaccaratConfigsModel";

export class BlockchainBaccaratConfig implements BlockchainConfig {
    minBetTime = 1;
    fullTime = 48;
    fullTimeNewShoe = 58;
    betTime = 30;
    stopBetTime = 3;
    waitTime = 20;
}
