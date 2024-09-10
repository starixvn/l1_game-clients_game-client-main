import AnimationUtils from "../../common/utils/AnimationUtils";
import { EmitterEvents, Store } from "../_gateway_game/models/definitions";
import { GameData } from "../_gateway_game/models/gateway-game-data";
import RenderItem from "./render-item";
const { ccclass, property } = cc._decorator;

@ccclass
export default class NewShoeRender extends RenderItem {
    private _gameData: GameData = null;

    init(data: GameData) {
        this.node.active = false;

        this._gameData = data;
        const store = data.getStore(Store.GameInfo);
        store?.addListener(EmitterEvents.TimeChange, this.onTimeChange);
        store?.addListener(EmitterEvents.ActiveNewShoe, this.onActiveNewShoe);
    }

    onDestroy() {
        const store = this._gameData?.getStore(Store.GameInfo);
        store?.removeListener(EmitterEvents.TimeChange, this.onTimeChange);
        store?.removeListener(EmitterEvents.ActiveNewShoe, this.onActiveNewShoe);
    }

    onActiveNewShoe = async (data: boolean) => {
        this.node.active = true;
        try {
            const spine = this.getComponentInChildren(sp.Skeleton);
            await AnimationUtils.playSpine(spine, "in", false);
            spine.setAnimation(0, "shuffling", true);
        } catch (e) {}
    };
    onTimeChange = async (time: number) => {
        if (time < 34 && this.node.active) {
            try {
                const spine = this.getComponentInChildren(sp.Skeleton);
                await AnimationUtils.playSpine(spine, "out", false);
                this.node.active = false;
            } catch (e) {
                this.node.active = false;
            }
        }
    };
}
