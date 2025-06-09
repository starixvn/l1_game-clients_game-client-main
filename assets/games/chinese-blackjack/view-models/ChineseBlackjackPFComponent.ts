import ClientSeedManualPopup from "../../_base/view-models/provably-fair/ClientSeedManualPopup";
import ProvablyFairComponent from "../../_base/view-models/provably-fair/ProvablyFairComponent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ChineseBlackjackPFComponent extends ProvablyFairComponent {
    @property(cc.Button)
    btnClientSeedIncrease: cc.Button = null;

    @property(cc.Button)
    btnClientSeedDecrease: cc.Button = null;

    @property(cc.Button)
    btnClientSeed: cc.Button = null;

    @property()
    clientSeedMin = 0;

    @property()
    clientSeedMax = 103;

    private readonly CLIENT_SEED_RANGE = "0 - 103";

    onLoad() {
        this.setRandomClientSeed();
        super.onLoad();
    }

    onClickDecrementClientSeed() {
        if (this.currentClientSeed === this.clientSeedMin) {
            this.currentClientSeed = this.clientSeedMax;
        } else {
            this.currentClientSeed = (this.currentClientSeed - 1 + this.clientSeedMax) % this.clientSeedMax;
        }

        this.setClientSeed();
    }

    onClickIncreaseClientSeed() {
        if (this.currentClientSeed === this.clientSeedMax) {
            this.currentClientSeed = this.clientSeedMin;
        } else {
            this.currentClientSeed = (this.currentClientSeed + 1) % (this.clientSeedMax + 1);
        }
        this.setClientSeed();
    }

    onChangeInputLimit(value: string) {
        let currentValue = +value;
        if (currentValue > 103) {
            currentValue = 103;
        } else if (currentValue < 0) {
            currentValue = 0;
        }

        this.currentClientSeed = currentValue;
        this.setClientSeed();
    }

    private getRandomClientSeed() {
        return Math.floor(Math.random() * (this.clientSeedMax - this.clientSeedMin + 1)) + this.clientSeedMin; // NOSONAR
    }

    setClientSeedUIState(isEnable: boolean) {
        this.btnClientSeedIncrease.interactable = isEnable;
        this.changeOpacity(this.btnClientSeedIncrease.node, isEnable);
        this.btnClientSeedDecrease.interactable = isEnable;
        this.changeOpacity(this.btnClientSeedDecrease.node, isEnable);
        this.btnClientSeed.interactable = isEnable;
    }

    setRandomClientSeed() {
        this.currentClientSeed = this.getRandomClientSeed();
        this.lblClientSeed.string = this.currentClientSeed.toString();
    }

    onClientSeedClick() {
        super.onClientSeedClick();
        const clientSeedManual = cc.instantiate(this.clientSeedManualPrefab);
        const clientSeedManualCpt = clientSeedManual.getComponent(ClientSeedManualPopup);
        clientSeedManualCpt.initClientSeedManualPopup({
            clientSeedRange: this.CLIENT_SEED_RANGE,
            clientSeed: this.lblClientSeed.string || ""
        });
        clientSeedManualCpt.provablyFairComponent = this;
        clientSeedManualCpt.callbackOpenGuide = () => {
            this.onGuideClick();
        };
        clientSeedManualCpt.callbackUpdateClientSeed = (value: string) => {
            this.updateClientSeed(value);
        };

        this.node.addChild(clientSeedManual);
    }
}
