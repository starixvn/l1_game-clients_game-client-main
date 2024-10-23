import { BaseEventHandler } from "../../_new/_base/game-data-management/event-handlers/base-handler";
import NewGameData from "../models/NewGameData";

export type MultiplierEvent = {
    multiplierValue: number;
    multiplierChoice: string;
};

export class MultiplierHandler extends BaseEventHandler<MultiplierEvent> {
    protected readonly gameData: NewGameData;
    protected verifyEvent(event: MultiplierEvent) {
        return event.multiplierValue !== undefined && event.multiplierChoice !== undefined;
    }

    protected handle(event: MultiplierEvent) {
        this.gameData.multiplier.change(event);
    }
}
