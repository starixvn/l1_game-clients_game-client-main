import BaccaratBigRoad from "../../../../_baccarat/view-models/BaccaratBigRoad";
import { BlockchainBaccaratRoundHistory } from "../../../event-models/BlockchainBaccaratRoundHistory";
const { ccclass } = cc._decorator;

@ccclass
export default class BlockChainBaccaratBigRoad extends BaccaratBigRoad {
    public renderScoreBoardInGame(data: BlockchainBaccaratRoundHistory[]) {
        this.firstRender = false;
        this.isRenderedNext = false;
        super.renderScoreBoardInGame(data);
    }
}
