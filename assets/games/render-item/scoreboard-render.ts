import BaccaratBigRoad from "../_baccarat/view-models/BaccaratBigRoad";
import { EmitterEvents, Store } from "../_gateway_game/models/definitions";
import { GameData } from "../_gateway_game/models/game-data";
import RenderItem from "./render-item";
const { ccclass, property } = cc._decorator;

@ccclass
export default class ScoreboardRender extends RenderItem {
    @property(BaccaratBigRoad)
    scoreboard: BaccaratBigRoad = null;

    private _gameData: GameData = null;
    init(data: GameData) {
        this._gameData = data;
        const store = data.getStore(Store.RoundHistory);
        store?.addListener(EmitterEvents.RoundHistoryChange, this.onData);
    }

    onDestroy() {
        const store = this._gameData?.getStore(Store.RoundHistory);
        store?.removeListener(EmitterEvents.RoundHistoryChange, this.onData);
    }

    onData = (data: any) => {
        this.scoreboard.renderScoreBoardInGame(data);
    };
}
