import { ColumnLengthPattern } from "sc-scoreboards";
import BaccaratBigRoad from "../../_baccarat/view-models/BaccaratBigRoad";
import { GatewayPanelStoreEvent } from "../gateway-panel-store-event";
import { GatewayPanelStoreObserver } from "../gateway-panel-store-observer";
const { ccclass, property } = cc._decorator;
@ccclass
export class GoodRoadPatternChanger extends GatewayPanelStoreObserver {
    @property(BaccaratBigRoad)
    bigRoad: BaccaratBigRoad = null;

    onLoad() {
        super.onLoad();

        this.updateSelectedPatterns(this.store.patterns);
        this.store.node.on(GatewayPanelStoreEvent.ChangedGoodRoadPattern, this.updateSelectedPatterns.bind(this), this);
    }

    updateSelectedPatterns(patterns: ColumnLengthPattern[]) {
        this.bigRoad?.updatePatterns(patterns);
    }
}
