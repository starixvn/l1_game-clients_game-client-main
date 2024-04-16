import { BlockchainBaccaratConfigData } from "./../event-models/BlockchainBaccaratConfigsModel";
import BlockchainBaccarat from "../view-models/BlockchainBaccarat";

export const updateGameConfigs = (mainGame: BlockchainBaccarat) => (configs: BlockchainBaccaratConfigData) => {
    mainGame.setGameConfigs(configs);
};
