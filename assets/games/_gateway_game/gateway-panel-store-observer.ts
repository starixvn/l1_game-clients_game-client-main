import { GatewayPanelStore } from "./gateway-panel-store";

const { ccclass, property } = cc._decorator;

@ccclass
export class GatewayPanelStoreObserver extends cc.Component {
    protected store: GatewayPanelStore = null;

    onLoad() {
        this.store = cc.director.getScene().getComponentInChildren(GatewayPanelStore);
    }

    onDestroy() {
        this.store?.node?.targetOff(this);
        this.store = null;
    }
}
