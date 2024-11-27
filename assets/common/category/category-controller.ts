import GatewayGameItem from "../../games/_gateway_game/gateway-game-item";
import { CategoryEvent } from "./category-events";
import CategoryItem from "./category-item";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CategoryController extends cc.Component {
    @property(cc.Node)
    container: cc.Node = null;

    _items: cc.Node[] = [];
    _toggles: cc.Toggle[] = [];

    categories: string[] = [];
    allCategories: string[] = [];
    extraFilter = (item: cc.Node) => true;

    get items(): cc.Node[] {
        if (this._items.length === 0) {
            this._items = this.container.children;
        }
        return this._items;
    }

    get toggles(): cc.Toggle[] {
        if (this._toggles.length === 0) {
            this._toggles = this.getComponentsInChildren(cc.Toggle);
        }
        return this._toggles;
    }

    onToggleCategoryChanged(toggle: cc.Toggle) {
        const categoryItem = toggle.getComponent(CategoryItem);
        const isChecked = toggle.isChecked;

        this.changeCategory(categoryItem.category, isChecked);
    }

    setAllCategories(categories: string[]) {
        this.allCategories = categories;
    }

    initCategories(allCategories: string[], storageCategories: string[]) {
        allCategories && (this.allCategories = allCategories);
        this.categories = storageCategories;

        this.toggles.forEach((toggle) => {
            const item = toggle.getComponent(CategoryItem);
            if (this.categories.includes(item.category)) {
                toggle.check();
            }
        });
        this.updateItemVisibility();
    }

    changeCategory(category: string, checked: boolean) {
        if (checked) {
            this.categories.push(category);
            this.removeDuplicateCategory();
        } else {
            const index = this.categories.indexOf(category);
            this.categories.splice(index, 1);
        }

        this.node.emit(CategoryEvent.Changed, this.categories);
        this.updateItemVisibility();
        this.updateSortOrder();
    }

    updateVisibility() {
        this.updateItemVisibility();
    }

    changeExtraFilter(filter: (item: cc.Node) => boolean) {
        if (filter) {
            this.extraFilter = filter;
        } else {
            this.extraFilter = () => true;
        }
        this.updateVisibility();
    }

    private removeDuplicateCategory() {
        this.categories = this.categories.filter(
            (iterator, index, categories) => categories?.findIndex((category) => category === iterator) === index
        );
    }

    updateItemVisibility() {
        const categories = this.categories.length > 0 ? this.categories : this.allCategories;
        const items = this.container.children;
        items.forEach((item) => {
            const comps = item.getComponents(CategoryItem);
            item.active = comps.some((comp) => categories.includes(comp.category) && this.extraFilter(item));
        });
    }

    updateSortOrder() {
        this.items.forEach((item) => {
            const gameItem = item.getComponent(GatewayGameItem);

            if (gameItem) {
                gameItem.node.zIndex = gameItem.gameId;
            }
        });
    }
}
