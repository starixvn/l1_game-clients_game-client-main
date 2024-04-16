import EventEmitterBase from "../../../common/emitter/EventEmitterBase";
import FootballSlotChoices from "./FootballSlotChoices";

export class FootBallSlotPlaceBetModel extends EventEmitterBase {
    constructor() {
        super();
        this.choices = new FootballSlotChoices();
        this.previousChoices = new FootballSlotChoices();
    }

    static Events = {
        PLACE_BET: "placeBet",
        PLACE_BET_CHIPS: "placeBetChips",
        UPDATE_CHIPS: "updateChips"
    };

    choices: any;
    previousChoices: any;

    placeBet(choice: string, amount: number) {
        this.choices[choice] = this.choices[choice] ? this.choices[choice] + amount : amount;
        this.emit(FootBallSlotPlaceBetModel.Events.PLACE_BET, this);
        this.emit(FootBallSlotPlaceBetModel.Events.PLACE_BET_CHIPS, {
            currentChoice: choice,
            currentAmount: amount,
            totalAmount: this.choices[choice]
        });
    }
}
