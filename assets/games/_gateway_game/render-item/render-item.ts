import { GameDataBase } from "../models/game-data-base";

const { ccclass, property } = cc._decorator;

@ccclass
export default abstract class RenderItem extends cc.Component {
    protected _gameData: GameDataBase = null;
    init(data: GameDataBase) {
        this._gameData = data;
    }
    protected onData: (data: any) => void;
    clearRenderListeners() {}
    onDestroy() {
        this.clearRenderListeners();
    }
}
