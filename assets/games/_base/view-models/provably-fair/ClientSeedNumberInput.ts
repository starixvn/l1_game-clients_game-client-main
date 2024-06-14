import ProvablyFairComponent from "./ProvablyFairComponent";

const { ccclass, property } = cc._decorator;

export type ProvablyFairType = {
    hashValue: string;
    clientSeed?: number;
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
    nodeWarningText: cc.Node = null;
    
    clickRandomMode(){
        cc.log("random click");
    }
    
    clickManualMode(){
        cc.log("random click");
    }
}
