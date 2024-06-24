import * as _ from "lodash";
import GameUtils from "../../../../common/GameUtils";
import ClientSeedManualPopup from "./ClientSeedManualPopup";
import ProvablyFairComponent from "./ProvablyFairComponent";

const { ccclass, property } = cc._decorator;

export type ProvablyFairType = {
    hashValue: string;
    clientSeed?: number;
};

export type PFSetting = {
    manualClientSeed: string;
    randomClientSeed: string;
    randomClientSeedEnabled: boolean;
};

@ccclass
export default class ClientSeedNumberInput extends ProvablyFairComponent {
    @property(cc.Label)
    lblManualClientSeed: cc.Label = null;

    @property(cc.Node)
    nodeManualPopup: cc.Node = null;

    @property(cc.Node)
    nodeOverlayChangeBtn: cc.Node = null;

    @property(cc.Toggle)
    tglRandomClientSeed: cc.Toggle = null;

    @property(cc.Toggle)
    tglManualClientSeed: cc.Toggle = null;

    @property(cc.Node)
    nodeRandomLabelDisabledBg: cc.Node = null;

    @property(cc.Node)
    nodeManualLabelDisabledBg: cc.Node = null;

    @property(cc.Node)
    nodeChangeButtonDisabledBg: cc.Node = null;

    @property(cc.Button)
    changeButton: cc.Button = null;

    @property(cc.Label)
    randomLabel: cc.Label = null;

    @property(cc.Label)
    manualLabel: cc.Label = null;

    @property(cc.Node)
    nodeWarningText: cc.Node = null;

    private localStorageKeys: string;
    private pfSetting: PFSetting = {
        manualClientSeed: "",
        randomClientSeed: this.randomClientSeedValue(),
        randomClientSeedEnabled: true
    };
    CLIENT_SEED_RANGE = "0 - 9999";

    private isEnabled = true;

    onLoad(): void {
        super.onLoad();
        this.nodeWarningText.active = false;
    }

    onShow(): void {
        super.onShow();
        if (!this.gameId) {
            return;
        }
        this.localStorageKeys = `PF_Setting_${this.gameId};`;
        const pfSetting = this.getPFSetting();
        if (Object.keys(pfSetting).length) {
            this.pfSetting = pfSetting;
        } else {
            this.updatePFSetting();
        }
        this.randomLabel.string = pfSetting.randomClientSeed;
        if (pfSetting.randomClientSeedEnabled) {
            this.manualLabel.string = "";
        } else {
            this.manualLabel.string = pfSetting.manualClientSeed;
        }
        this.updateModeUI(pfSetting.randomClientSeedEnabled);
    }

    getPFSetting(): PFSetting {
        return GameUtils.getStorageGame(this.localStorageKeys, this.gameId);
    }

    updatePFSetting() {
        GameUtils.setStorageGame(this.localStorageKeys, this.gameId, this.pfSetting);
    }

    generateRandomClientSeed() {
        this.pfSetting.randomClientSeed = this.randomClientSeedValue();
        this.updatePFSetting();
    }

    randomClientSeedValue(): string {
        return _.random(0, 9999).toString();
    }

    getClientSeed() {
        return this.pfSetting.randomClientSeedEnabled ? this.pfSetting.randomClientSeed : this.pfSetting.manualClientSeed;
    }

    clickRandomMode() {
        if (!this.isEnabled) {
            return;
        }
        this.pfSetting.manualClientSeed = this.pfSetting.randomClientSeed;
        this.updateModeUI(true);
    }

    clickManualMode() {
        if (!this.isEnabled) {
            return;
        }
        this.updateModeUI(false);
        this.onClientSeedClick();
    }

    private updateModeUI(isRandom: boolean) {
        this.tglManualClientSeed.isChecked = !isRandom;
        this.tglRandomClientSeed.isChecked = isRandom;
        this.nodeManualLabelDisabledBg.active = isRandom;
        this.nodeRandomLabelDisabledBg.active = !isRandom;
        this.randomLabel.string = this.pfSetting.randomClientSeed;
        this.pfSetting.randomClientSeedEnabled = isRandom;
        this.updatePFSetting();
        if (this.pfSetting.randomClientSeedEnabled) {
            this.manualLabel.string = "";
            this.nodeChangeButtonDisabledBg.active = true;
            this.changeButton.interactable = false;
        } else {
            this.manualLabel.string = this.pfSetting.manualClientSeed;
            this.nodeChangeButtonDisabledBg.active = false;
            this.changeButton.interactable = true;
        }
        if (!this.isEnabled) {
            this.nodeManualLabelDisabledBg.active =
                this.nodeRandomLabelDisabledBg.active =
                this.nodeChangeButtonDisabledBg.active =
                    !this.isEnabled;
            this.changeButton.interactable = this.isEnabled;
        }
    }

    onClientSeedClick(): void {
        const clientSeedManual = cc.instantiate(this.clientSeedManualPrefab);
        const clientSeedManualCpt = clientSeedManual.getComponent(ClientSeedManualPopup);
        clientSeedManualCpt.clientSeedMax = 9999;
        clientSeedManualCpt.initClientSeedManualPopup({
            clientSeedRange: this.CLIENT_SEED_RANGE,
            clientSeed: this.manualLabel.string || ""
        });
        clientSeedManualCpt.provablyFairComponent = this;
        clientSeedManualCpt.callbackOpenGuide = () => {
            this.onGuideClick();
        };
        clientSeedManualCpt.callbackUpdateClientSeed = (value: string) => {
            this.pfSetting.manualClientSeed = this.manualLabel.string = value;
            this.updatePFSetting();
        };

        this.node.addChild(clientSeedManual);
    }

    setClientSeedUIState(isEnabled: boolean) {
        this.isEnabled = isEnabled;
        const disableBg = !isEnabled;
        if (this.pfSetting.randomClientSeedEnabled) {
            this.nodeRandomLabelDisabledBg.active = disableBg;
        } else {
            this.nodeManualLabelDisabledBg.active = disableBg;
            this.nodeChangeButtonDisabledBg.active = disableBg;
        }
        this.tglRandomClientSeed.interactable = this.tglManualClientSeed.interactable = this.changeButton.interactable = isEnabled;

        !isEnabled && (this.nodeWarningText.active = true);
    }

    handleResetNewRound() {
        this.generateRandomClientSeed();
        this.nodeWarningText.active = false;
        this.updateModeUI(this.pfSetting.randomClientSeedEnabled);
        this.setClientSeedUIState(true);
    }
}
