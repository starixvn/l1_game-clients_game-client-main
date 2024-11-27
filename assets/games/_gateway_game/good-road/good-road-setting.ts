import CommonDialog from "../../../common/_base/view-models/CommonDialog";
import { GatewayPanelStoreEvent } from "../gateway-panel-store-event";
import { GatewayPanelStoreObserver } from "../gateway-panel-store-observer";

const { ccclass, property } = cc._decorator;
@ccclass
export class GoodRoadSetting extends GatewayPanelStoreObserver {
    @property({ type: cc.Toggle })
    toggleAll: cc.Toggle = null;

    @property(cc.Node)
    patternToggleContainer: cc.Node = null;

    patternToggles: cc.Toggle[] = [];

    selectedFlag = {};

    private configToggles = [];

    onLoad() {
        super.onLoad();
        const dialog = this.node.getComponentsInChildren(CommonDialog)[0];
        dialog?.addOnDidHide(() => {
            this.node.destroy();
        });
        this.patternToggles = this.patternToggleContainer.getComponentsInChildren(cc.Toggle);

        this.renderConfig(this.store.config);
        this.renderPatterns(this.store.selectedPatternFlag);

        this.store.node.on(GatewayPanelStoreEvent.ChangedSelectedPatternFlag, this.renderPatterns.bind(this), this);
    }

    renderConfig(config) {
        this.configToggles = config;

        try {
            this.patternToggles.forEach((toggle, index) => {
                const key = this.configToggles[index].key;
                toggle.node.name = key;
                const label = toggle.node.getComponentInChildren("LocalizedLabelWithFormat");
                label.dataId = `BaccaratX.${key}`;
            });
        } catch (e) {
            cc.log(e);
        }
    }

    renderPatterns(selectedFlag) {
        this.selectedFlag = selectedFlag;

        this.updateCheckedToggles();
    }

    updateSelectedPatterns(key: string, checked: boolean) {
        if (!checked) {
            this.toggleAll.isChecked = false;
        }
        this.selectedFlag[key] = checked;

        this.store.onChangePatterns(this.selectedFlag);
    }

    onToggleAll(toggle: cc.Toggle) {
        const activeAll = toggle.isChecked;
        this.patternToggles.forEach((toggle) => (toggle.isChecked = activeAll));
    }

    onSinglePatternToggle(toggle: cc.Toggle) {
        this.updateSelectedPatterns(toggle.node.name, toggle.isChecked);
    }

    updateCheckedToggles() {
        let isAllCheck = true;
        this.patternToggles.forEach((toggle) => {
            const isCheck = this.selectedFlag[toggle.node.name];
            toggle.isChecked = isCheck;

            if (!isCheck) {
                isAllCheck = false;
            }
        });

        this.toggleAll.isChecked = isAllCheck;
    }
}
