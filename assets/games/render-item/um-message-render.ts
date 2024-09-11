import { EmitterEvents, Store } from "../_gateway_game/models/definitions";
import { GameData } from "../_gateway_game/models/gateway-game-data";
import RenderItem from "./render-item";
const { ccclass, property } = cc._decorator;

@ccclass
export default class UmMessageRender extends RenderItem {
    @property(cc.Label)
    label: cc.Label = null;

    private _gameData: GameData = null;

    init(data: GameData) {
        this.node.active = false;

        this._gameData = data;
        const store = data.getStore(Store.DisableGame);
        store?.addListener(EmitterEvents.UmMessage, this.onChangeUmMessage);
        store?.addListener(EmitterEvents.DisabledGame, this.onChangeDisabledGame);

        store?.wakeUp();
    }

    onDestroy() {
        const store = this._gameData?.getStore(Store.DisableGame);
        store?.removeListener(EmitterEvents.UmMessage, this.onChangeUmMessage);
        store?.removeListener(EmitterEvents.DisabledGame, this.onChangeDisabledGame);
    }

    onChangeDisabledGame = (data: boolean) => {
        this.node.active = data;
    };

    onChangeUmMessage = (message: string) => {
        this.label && (this.label.string = message);
    };
}
