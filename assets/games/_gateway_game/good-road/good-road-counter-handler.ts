import BaccaratBigRoad from "../../_baccarat/view-models/BaccaratBigRoad";
import { GatewayPanelStoreObserver } from "../gateway-panel-store-observer";
import RenderItem from "../render-item/render-item";
const { ccclass, property } = cc._decorator;

@ccclass
export class GoodRoadCounterHandler extends GatewayPanelStoreObserver {
    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;

    @property(cc.Node)
    container: cc.Node = null;

    private bigRoads = {};

    init(dataGames: any) {
        Object.keys(dataGames).forEach((id) => {
            const gameData = dataGames[id];

            const node = cc.instantiate(this.itemPrefab);

            const renderItem = node.getComponent(RenderItem);
            renderItem.init(gameData);

            const bigRoad = node.getComponent(BaccaratBigRoad);
            this.bigRoads[id] = bigRoad;

            this.container.addChild(node);
            node.active = true;
            node.name = id;
        });

        this.schedule(this.checkGoodRoad, 1 / 30, cc.macro.REPEAT_FOREVER);
    }

    checkGoodRoad() {
        const goodRoadGames = Object.keys(this.bigRoads)
            .map((id) => {
                const bigRoad: BaccaratBigRoad = this.bigRoads[id];
                return bigRoad?.currentGoodRoad
                    ? {
                          id: +id,
                          goodRoad: bigRoad.currentGoodRoad
                      }
                    : null;
            })
            .filter((item) => item);

        this.store.updateGoodRoadGames(goodRoadGames);
    }
}
