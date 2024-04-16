import GameRoomBaseBetHandler from "../../_base/handlers/GameRoomBaseBetHandler";
import BlockchainBaccarat from "../view-models/BlockchainBaccarat";

export class BlockchainBaccaratBetHandler extends GameRoomBaseBetHandler {
    constructor(protected readonly main: BlockchainBaccarat) {
        super(main);
    }
}
