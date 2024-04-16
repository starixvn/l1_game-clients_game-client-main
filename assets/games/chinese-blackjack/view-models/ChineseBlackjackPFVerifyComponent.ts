import ProvablyFairVerifyComponent, {
    IProvablyFairVerify,
    OPEN_PROVABLY_FAIR_VERIFY
} from "../../_base/view-models/provably-fair/ProvablyFairVerifyComponent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ChineseBlackjackPFVerifyComponent extends ProvablyFairVerifyComponent {
    @property(cc.Label)
    handIdsLbl: cc.Label = null;

    updateProvablyFairVerify(data: IProvablyFairVerify) {
        if (!this.node.activeInHierarchy && this.node?.isValid) {
            this.serverSeedLbl.string = this.truncateString(data?.serverSeed.toString());
            this.serverSeedCopyString = data?.serverSeed;
            this.clientSeedLbl.string = data?.clientSeed.toString();
            this.serverSeedSHA256Lbl.string = this.truncateString(data?.hash.toString());
            this.hashCopyString = data?.hash;
            this.finalResultLbl.string = this.truncateString(data?.finalResult.toString());
            this.finalResultCopyString = data?.finalResult;
            this.handIdsLbl.string = this.formatHandIds(data?.handIds);

            this.node.emit(OPEN_PROVABLY_FAIR_VERIFY);
        }
    }

    formatHandIds(handIds: string) {
        return handIds
            ?.split(",")
            .map((val) => val.trim())
            .join(", ");
    }
}
