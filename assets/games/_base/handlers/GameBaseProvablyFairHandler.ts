import GameBase from "../GameBase";
import DataHandler from "./DataHandler";

export default class GameBaseProvablyFairHandler implements DataHandler {
    constructor(protected readonly main: GameBase) {}

    handle(data: any) {
        if (data.resultHash && Object.keys(data.resultHash).length) {
            this.main.provablyFairComponent?.handleReceiveServerSeed(data.resultHash);
        }

        if (data.clientSeed) {
            this.main.provablyFairComponent?.updateClientSeed(data?.clientSeed);
        }
        if (data.provablyFair || data.roundPFResult) {
            this.main.handleProvablyFairVerifyData(data.provablyFair || data.roundPFResult);
        }

        if (data.pf && Object.keys(data.pf).length) {
            this.main.provablyFairComponent?.handleReceiveServerSeed(data.pf);
        }

        if (data.ownBets && Object.keys(data.ownBets).length) {
            this.main.provablyFairComponent?.setClientSeedUIState(false);
        }
    }
}
