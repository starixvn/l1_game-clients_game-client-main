import { RoundHistoryHandler } from "../../_base_new/handlers/RoundHistoryHandler";
import { SettlemenHandler } from "../../_base_new/handlers/SettlementHandler";
import NewGameData from "../../_base_new/models/NewGameData";
import FootballSlotChoices from "./FootballSlotChoices";
import { FootBallSlotPlaceBetModel } from "./FootballSlotPlaceBetModel";

const { ccclass } = cc._decorator;

@ccclass
export default class FootballGameData extends NewGameData {
    readonly placeBetModel: FootBallSlotPlaceBetModel;
    totalBetAmount: FootballSlotChoices;

    constructor() {
        super();
        this.placeBetModel = new FootBallSlotPlaceBetModel();
        this.totalBetAmount = new FootballSlotChoices();
    }

    protected registerBaseEventHandlers() {
        const handlers = [RoundHistoryHandler, SettlemenHandler];
        this.eventHandlers.push(...handlers.map((Handler) => new Handler(this)));
    }
}
