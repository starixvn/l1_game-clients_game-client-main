import EventEmitterBase from "../../common/emitter/EventEmitterBase";
import BaccaratBigRoad from "../_baccarat/view-models/BaccaratBigRoad";
import { EmitterEvents } from "../_gateway_game/models/definitions";
import RenderItem from "./render-item";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ScoreboardRender extends RenderItem {
    @property(BaccaratBigRoad)
    scoreboard: BaccaratBigRoad = null;

    init(data: EventEmitterBase) {
        data.addListener(EmitterEvents.RoundHistoryChange, this.onData);
    }
    onData(data: any): void {
        this.scoreboard.renderScoreBoardInGame(data);
    }
}
