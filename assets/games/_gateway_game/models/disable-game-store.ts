import { EmitterEvents, Store, StoreBase } from "./definitions";

export interface RoundHistory {
    result: any;
    settlementResult: any;
    roundId: number;
}

export class DisableGameStore extends StoreBase {
    storeName = Store.DisableGame;
    disabledGame = false;
    umMessage = "";
    gameDisconnected = false;

    setDisabledGame(disable: boolean) {
        this.disabledGame = disable;
        this.emit(EmitterEvents.DisabledGame, this.disabledGame);
    }

    setUmMessage(message: string) {
        this.umMessage = message;
        this.emit(EmitterEvents.UmMessage, this.umMessage);
    }

    setConnectionError(value: boolean) {
        this.gameDisconnected = value;
    }

    updateUI() {
        this.emit(EmitterEvents.DisabledGame, this.disabledGame);
        this.emit(EmitterEvents.UmMessage, this.umMessage);
        this.emit(EmitterEvents.ConnectionFailed, this.gameDisconnected);
    }
}
