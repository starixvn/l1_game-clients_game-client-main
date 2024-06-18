import CommonDialog from "../../../../common/_base/view-models/CommonDialog";
import { ClientSeedInfo } from "./ClientSeedInfo";
import { LabelCopyComponent } from "./LabelCopyComponent";
import ProvablyFairVerifyComponent, { OPEN_PROVABLY_FAIR_VERIFY } from "./ProvablyFairVerifyComponent";

const { ccclass, property } = cc._decorator;

export interface IRoundBaseProvablyFairVerify {
    clientSeeds: any;
    mergeClientSeed: string;
    mergeSeed: string;
    serverSeed: string;
    serverSeedHash: string;
    result: object;
    finalHash: string;

    roundId: number;
}

@ccclass
export default class GameRoundBasePFVerifyComponent extends ProvablyFairVerifyComponent {
    @property(cc.Label)
    lblRoundId: cc.Label = null;

    @property(LabelCopyComponent)
    lblServerSeed: LabelCopyComponent = null;

    @property(LabelCopyComponent)
    lblServerSeedHash: LabelCopyComponent = null;

    @property(LabelCopyComponent)
    lblMergeClientSeed: LabelCopyComponent = null;

    @property(LabelCopyComponent)
    lblFinalHash: LabelCopyComponent = null;

    @property(cc.Label)
    lblParaVerification: cc.Label = null;

    @property(cc.Node)
    clientSeedsContainer: cc.Node = null;

    @property(cc.Node)
    nodeDisabledVerification: cc.Node = null;

    private listClientSeedInfo: ClientSeedInfo[] = [];

    onLoad() {
        this.initClientSeedsList();
        //super.onLoad();
        //const para = `${gc.Translator.commonTranslate("pf_provably_fair_para_2")}`;
        // this.lblParaVerification.string = para;
    }

    updateProvablyFairVerify(verification: IRoundBaseProvablyFairVerify) {
        const { serverSeed, serverSeedHash, mergeClientSeed, finalHash, clientSeeds, result, roundId } = verification;
        this.lblRoundId.string = roundId.toString();
        result && this.renderResult(result);

        serverSeed && this.lblServerSeed.setString(serverSeed);
        this.lblServerSeed.setActive(!!serverSeed);

        serverSeedHash && this.lblServerSeedHash.setString(serverSeedHash);
        this.lblServerSeedHash.setActive(!!serverSeedHash);

        mergeClientSeed && this.lblMergeClientSeed.setString(mergeClientSeed);
        this.lblMergeClientSeed.setActive(!!mergeClientSeed);

        finalHash && this.lblFinalHash.setString(finalHash);
        this.lblFinalHash.setActive(!!finalHash);

        if (this.listClientSeedInfo.length === 0) {
            this.initClientSeedsList();
        }
        this.listClientSeedInfo.forEach((clientSeedInfo) => {
            clientSeedInfo.activeDisabledBg(true);
        });
        if (clientSeeds && clientSeeds.length > 0) {
            clientSeeds.forEach((clientSeed, index) => {
                const info = this.listClientSeedInfo[index];
                info.setDisplay(clientSeed);
                info.activeDisabledBg(false);
            });
        }
        this.nodeDisabledVerification.active = !result;
        this.node.emit(OPEN_PROVABLY_FAIR_VERIFY);
    }

    private initClientSeedsList() {
        this.listClientSeedInfo = this.clientSeedsContainer.getComponentsInChildren(ClientSeedInfo);
    }

    private renderResult(result: any) {
        if (this.nodeResult) {
            const resultComp = this.nodeResult.getComponentInChildren(BaseResultBodyItem);
            resultComp.setData(result, result);
        }
    }
}

export class BaseResultBodyItem extends cc.Component {
    setData(result: any, settlementResult: any) {}
}
