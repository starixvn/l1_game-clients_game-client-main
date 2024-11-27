import CategoryController from "../../common/category/category-controller";
import { CategoryEvent } from "../../common/category/category-events";
import CategoryItem from "../../common/category/category-item";
import AnimationUtils from "../../common/utils/AnimationUtils";
import GatewayGameItem from "./gateway-game-item";
import { GatewayPanelStoreEvent } from "./gateway-panel-store-event";
import { GatewayPanelStoreObserver } from "./gateway-panel-store-observer";
import { GameDataBase } from "./models/game-data-base";
const { ccclass, property } = cc._decorator;

@ccclass
export class GatewayPanel extends GatewayPanelStoreObserver {
    @property(cc.Prefab)
    protected gamePrefab: cc.Prefab = null;

    @property(cc.Node)
    protected container: cc.Node = null;

    @property(cc.Toggle)
    toggleAll: cc.Toggle = null;

    @property(cc.Toggle)
    toggleGoodRoad: cc.Toggle = null;

    @property(CategoryController)
    categoryController: CategoryController = null;

    @property(cc.Node)
    nodeScrollView: cc.Node = null;

    @property(cc.Node)
    nodeEmptyList: cc.Node = null;

    @property(cc.Prefab)
    settingPrefab: cc.Prefab = null;

    goodRoads: number[] = [];
    dataGames = {};
    gameInfo = {};

    isShowAll = true;
    didRenderAllGamesFilter = false;
    didInitItems = false;
    orderGameIds: number[] = [];

    onLoad() {
        super.onLoad();

        this.renderAllGamesFilter(this.store.allGamesFilter);
        this.renderOrderGameIds(this.store.orderGameIds);
        this.renderGoodRoadIds(this.store.goodRoads);
        this.renderCategoryFilter(this.store.categoryFilter);

        this.store.node.on(GatewayPanelStoreEvent.ChangeAllGameFilter, this.renderAllGamesFilter.bind(this), this);
        this.store.node.on(GatewayPanelStoreEvent.ChangeOrderGameIds, this.renderOrderGameIds.bind(this), this);
        this.store.node.on(GatewayPanelStoreEvent.ChangeGoodRoads, this.renderGoodRoadIds.bind(this), this);
        this.store.node.on(GatewayPanelStoreEvent.ChangeCategoryFilter, this.renderCategoryFilter.bind(this), this);
    }

    renderAllGamesFilter(allGamesFilter: boolean) {
        if (this.didRenderAllGamesFilter) {
            return;
        }
        this.didRenderAllGamesFilter = true;
        if (allGamesFilter) {
            this.toggleAll.isChecked = true;
        } else {
            this.toggleGoodRoad.isChecked = true;
        }
        this.updateTabChanged(allGamesFilter);
    }

    async renderOrderGameIds(orderGameIds: number[]) {
        this.orderGameIds = orderGameIds;
    }

    renderGoodRoadIds(goodRoads: number[]) {
        this.goodRoads = goodRoads;
        this.categoryController.updateVisibility();

        this.checkEmptyListVisibility();
        this.updateSiblingIndex();
    }

    renderCategoryFilter(categoryFilter: string[]) {
        const comp = this.getComponentInChildren(CategoryController);
        if (comp) {
            comp.initCategories(null, categoryFilter);
        }

        this.initItemsWithCategory(categoryFilter);
        this.updateSiblingIndex();
    }

    async initItemsWithCategory(categoryFilter: string[]) {
        if (this.didInitItems) {
            return;
        }
        this.didInitItems = true;
        try {
            this.container.destroyAllChildren();
            const info = this.gameInfo;

            const firstGameIds =
                this.goodRoads.length > 0
                    ? this.orderGameIds.filter((gameId) => this.goodRoads.includes(gameId))
                    : this.orderGameIds.filter((gameId) => {
                          const { categories } = info[gameId];
                          return categories.some((category) => categoryFilter.includes(category));
                      });

            const otherGameIds = this.orderGameIds.filter((gameId) => !firstGameIds.includes(gameId));
            for (const gameId of [...firstGameIds, ...otherGameIds]) {
                const node = this.createItemForGameId(+gameId);
                this.container.addChild(node);
                this.categoryController.updateVisibility();
                await AnimationUtils.delayTime(0.1);
            }
        } catch (e) {}
    }

    updateSiblingIndex() {
        const orderIds = this.isShowAll || this.goodRoads.length === 0 ? this.orderGameIds : this.goodRoads;

        orderIds.forEach((gameId, index) => {
            const gameItem = this.container.getChildByName(`${gameId}`);
            if (gameItem) {
                gameItem.setSiblingIndex(index);
            }
        });
    }

    onClickSetting() {
        const node = cc.instantiate(this.settingPrefab);
        this.node.addChild(node);
    }

    checkEmptyListVisibility() {
        const existData = this.isShowAll || this.goodRoads.length > 0;

        this.nodeScrollView.active = existData;
        this.nodeEmptyList.active = !existData;
    }

    onDestroy(): void {
        this.dataGames = {};
        super.onDestroy();
    }

    private createItemForGameId(gameId: number) {
        const info = this.gameInfo;
        const node = cc.instantiate(this.gamePrefab);
        node.setSiblingIndex(this.orderGameIds.indexOf(gameId));

        node.name = `${gameId}`;

        const item = node.getComponent(GatewayGameItem);
        const { gameName, categories } = info[gameId];
        const gameData: GameDataBase = this.dataGames[gameId];
        item.init({ gameId: +gameId, gameName, gameData });

        categories.forEach((category) => {
            const comp = item.addComponent(CategoryItem);
            comp.category = category;
        });

        return node;
    }

    initItems(dataGames, info: { [gameId: number]: { gameName: string; categories: string[] } }) {
        this.dataGames = dataGames;
        this.gameInfo = info;
        let allCatogories = [];
        Object.keys(info).forEach((gameId) => {
            const { categories } = info[gameId];
            allCatogories.push(...categories);
        });

        allCatogories = allCatogories.filter(
            (iterator, index, categories) => categories?.findIndex((category) => category === iterator) === index
        );

        const comp = this.getComponentInChildren(CategoryController);
        if (comp) {
            comp.node.on(CategoryEvent.Changed, this.saveCategoryFilter.bind(this), this);
            comp.setAllCategories(allCatogories);
        }
    }

    saveCategoryFilterToStore(categories: string[]) {
        this.store.saveCategoryFilter(categories);
    }

    onTabChanged(toggle: cc.Toggle) {
        const isAll = toggle.node.name === "all";
        this.updateTabChanged(isAll);

        this.store.saveAllGamesFilter(this.isShowAll);
    }

    private updateTabChanged(isAll: boolean) {
        this.isShowAll = isAll;
        if (isAll) {
            this.categoryController.changeExtraFilter(null);
        } else {
            const goodRoadFilter = (item: cc.Node) => {
                const gameId = +item.name;
                return this.goodRoads.includes(gameId);
            };
            this.categoryController.changeExtraFilter(goodRoadFilter);
        }

        this.checkEmptyListVisibility();
        this.updateSiblingIndex();
    }

    saveCategoryFilter(categories: string[]) {
        this.saveCategoryFilterToStore([...categories]);
    }
}
