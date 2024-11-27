import AudioManager from "../../../common/audio/AudioManager";
import { uiManager } from "../../../managers/GameUIManager";
import { GatewayPanelStoreEvent } from "../gateway-panel-store-event";

const { ccclass, property } = cc._decorator;
@ccclass
export class GoodRoadSettingContainer extends cc.Component {
    @property(cc.Prefab)
    prefab: cc.Prefab = null;

    onLoad() {
        uiManager.emitterListener(GatewayPanelStoreEvent.OpenGoodRoadSetting, this.openGoodRoadSetting, this);
    }

    openGoodRoadSetting() {
        AudioManager.getInstance().playClick();
        const node = cc.instantiate(this.prefab);
        this.node.addChild(node);
    }
}
