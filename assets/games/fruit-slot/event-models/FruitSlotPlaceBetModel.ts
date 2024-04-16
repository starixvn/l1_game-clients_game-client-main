import EventEmitterBase from "../../../common/emitter/EventEmitterBase";
import FruitSlotChoices from "./FruitSlotChoices";

export class FruitSlotPlaceBetModel extends EventEmitterBase {
    constructor() {
        super();
        this.choices = new FruitSlotChoices();
        this.previousChoices = new FruitSlotChoices();
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
        this.emit(FruitSlotPlaceBetModel.Events.PLACE_BET, this);
        this.emit(FruitSlotPlaceBetModel.Events.PLACE_BET_CHIPS, {
            currentChoice: choice,
            currentAmount: amount,
            totalAmount: this.choices[choice]
        });
    }
}
