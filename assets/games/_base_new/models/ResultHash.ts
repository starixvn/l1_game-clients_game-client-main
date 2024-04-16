import EventEmitterBase from "../../../common/emitter/EventEmitterBase";

export class ResultHash extends EventEmitterBase {
    static Events = {
        CHANGE: "ResultHash:CHANGE"
    };

    protected hash: any;

    change(resultHash: any) {
        this.hash = resultHash;
        this.emit(ResultHash.Events.CHANGE, this.hash);
    }

    changeLater(resultHash: any) {
        this.hash = resultHash;
    }

    updateUI() {
        this.hash && this.emit(ResultHash.Events.CHANGE, this.hash);
    }
}
