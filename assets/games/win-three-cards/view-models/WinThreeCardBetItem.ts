import BaccaratBetItem from "../../baccarat/view-models/BaccaratBetItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class WinThreeCardBetItem extends BaccaratBetItem {
    @property(cc.Label)
    betPercent: cc.Label = null;
}
