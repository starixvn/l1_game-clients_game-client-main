import NoticeUtil from "../../../common/utils/NoticeUtil";
import { EmitterEvents, Store } from "../models/definitions";
import RenderItem from "./render-item";
const { ccclass, property } = cc._decorator;

@ccclass
export default class ConnectionErrorRender extends RenderItem {
    onLoad() {
        this.node.active = false;

        const data = this._gameData;
        const store = data.getStore(Store.DisableGame);
        store?.addListener(EmitterEvents.ConnectionFailed, this.onChangeConnectionFailed, this);

        store?.wakeUp();
    }

    clearRenderListeners() {
        const store = this._gameData?.getStore(Store.DisableGame);
        store?.removeAll(this);
    }

    onChangeConnectionFailed = (isFailed: boolean) => {
        this.node.active = isFailed;

        const label = this.getComponentInChildren(cc.Label);
        if (label) {
            label.string = NoticeUtil.getLocalizedErrorMessage("SB0010", {});
        }
    };
}
