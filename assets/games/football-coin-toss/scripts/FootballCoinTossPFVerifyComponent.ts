import GameRoundBasePFVerifyComponent from "../../_base/view-models/provably-fair/GameRoundBasePFVerifyComponent";
import { OPEN_PROVABLY_FAIR_VERIFY } from "../../_base/view-models/provably-fair/ProvablyFairVerifyComponent";
import FootballCoinTossResultBodyItem from "./FootballCoinTossResultBodyItemPF";

const { ccclass } = cc._decorator;
export interface IRoundProvablyFairVerify {
    clientSeeds: any;
    mergeClientSeed: string;
    mergeSeed: string;
    serverSeed: string;
    serverSeedHash: string;
    result: object;
    finalHash: string;
    roundId: number;
    match: any;
}

@ccclass
export default class FootballCoinTossPFVerifyComponent extends GameRoundBasePFVerifyComponent {
    updateProvablyFairVerify(verification: IRoundProvablyFairVerify) {
        this.provablyFair = verification;
        const { serverSeed, serverSeedHash, mergeClientSeed, finalHash, clientSeeds, result, roundId, match } = verification;
        this.lblRoundId.string = roundId?.toString() ?? ""; 
        result && this.renderRoundResult(result, match);
        if (!this.node.activeInHierarchy && this.node?.isValid) {
            this.serverSeedLbl.string = this.truncateString(serverSeed ?? "".toString());
            this.serverSeedCopyString = serverSeed ?? "";
            this.lblMergeClientSeed.string = mergeClientSeed ?? "".toString();
            this.mergeSeedClientCopyString = mergeClientSeed ?? "";
            this.serverSeedSHA256Lbl.string = this.truncateString(serverSeedHash ?? "".toString());
            this.hashCopyString = serverSeedHash ?? "";
            this.finalResultLbl.string = this.truncateString(finalHash ?? "".toString());
            this.finalResultCopyString = finalHash ?? "";
        }

        if (this.listClientSeedInfo.length === 0) {
            this.initClientSeedsList();
        }
        this.listClientSeedInfo.forEach((clientSeedInfo) => {
            clientSeedInfo.activeDisabledBg(true);
            clientSeedInfo.resetClientSeedData();
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

    private renderRoundResult(result: any, match: any) {
        if (this.nodeResult) {
            const resultComp = this.nodeResult?.getComponentInChildren(FootballCoinTossResultBodyItem);
            resultComp.setData(result, match);
        }
    }
}
