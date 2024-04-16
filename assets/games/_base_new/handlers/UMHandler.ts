import { BaseEventHandler } from "../../_new/_base/game-data-management/event-handlers/base-handler";
import NewGameData from "../models/NewGameData";

export type UMType = {
    um?: any;
};

export class UMHandler extends BaseEventHandler<UMType> {
    protected readonly gameData: NewGameData;
    protected verifyEvent(event: UMType) {
        return true;
    }

    protected handle(event: UMType) {
        if (event.um) {
            this.gameData.umModel.onUM(event);
        } else {
            this.gameData.umModel.checkToOffUM(event);
        }
    }
}
