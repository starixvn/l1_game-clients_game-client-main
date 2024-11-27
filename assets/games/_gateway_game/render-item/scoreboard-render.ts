import BaccaratBigRoad from "../../_baccarat/view-models/BaccaratBigRoad";
import { EmitterEvents, Store } from "../models/definitions";
import RenderItem from "./render-item";
const { ccclass, property } = cc._decorator;

@ccclass
export default class ScoreboardRender extends RenderItem {
    @property(BaccaratBigRoad)
    scoreboard: BaccaratBigRoad = null;

    onLoad() {
        const data = this._gameData;
        const store = data.getStore(Store.RoundHistory);
        store?.addListener(EmitterEvents.RoundHistoryChange, this.onData, this);

        const infoStore = data.getStore(Store.GameInfo);
        infoStore?.addListener(EmitterEvents.LockingBet, this.showNextNode, this);

        store?.wakeUp();
    }

    clearRenderListeners() {
        const store = this._gameData?.getStore(Store.RoundHistory);
        store?.removeAll(this);

        const infoStore = this._gameData?.getStore(Store.GameInfo);
        infoStore?.removeAll(this);
    }

    showNextNode = () => {
        this.scoreboard.renderNextNode();
    };

    onData = (data: any) => {
        this.scoreboard.clearNextNode();
        if (data.length === 0) {
            this.scoreboard.resetBoard();
        } else {
            this.scoreboard.renderScoreBoardInGame(data);
        }
    };
}
