import NewGameData from "../../_base_new/models/NewGameData";
import FruitSlotChoices from "./FruitSlotChoices";
import { FruitSlotPlaceBetModel } from "./FruitSlotPlaceBetModel";
import { SettlemenHandler } from "../../_base_new/handlers/SettlementHandler";
import { RoundHistoryHandler } from "../../_base_new/handlers/RoundHistoryHandler";

const { ccclass } = cc._decorator;

@ccclass
export default class FruitSlotGameData extends NewGameData {
    readonly placeBetModel: FruitSlotPlaceBetModel;
    totalBetAmount: FruitSlotChoices;

    constructor() {
        super();
        this.placeBetModel = new FruitSlotPlaceBetModel();
        this.totalBetAmount = new FruitSlotChoices();
    }

    protected registerBaseEventHandlers() {
        const handlers = [RoundHistoryHandler, SettlemenHandler];
        this.eventHandlers.push(...handlers.map((Handler) => new Handler(this)));
    }
}
