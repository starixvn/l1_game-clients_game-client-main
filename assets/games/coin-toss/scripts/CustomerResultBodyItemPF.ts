import { i18n } from "../../../ClientModules";
import { BaseResultBodyItem } from "../../_base/view-models/provably-fair/GameRoundBasePFVerifyComponent";
import { findWinningChoice } from "./MiniCoinTossHelper";
const { ccclass, property } = cc._decorator;
@ccclass
export default class CustomerResultBodyItem extends BaseResultBodyItem {
    @property(cc.Label)
    lblResult: cc.Label = null;

    setData(result: any, settlementResult: any) {
        const key = findWinningChoice(settlementResult);
        this.lblResult.string = i18n.t(`CoinToss.glossary_${key}`).toUpperCase();
    }
}
