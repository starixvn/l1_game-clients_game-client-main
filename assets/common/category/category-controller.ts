import CategoryItem from "./category-item";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CategoryController extends cc.Component {
    @property(cc.Node)
    container: cc.Node = null;

    _items: cc.Node[] = [];

    get items(): cc.Node[] {
        if (this._items.length === 0) {
            this._items = this.container.children;
        }
        return this._items;
    }

    onToggleCategoryChanged(toggle: cc.Toggle) {
        const categoryItem = toggle.getComponent(CategoryItem);
        this.changeCategory(categoryItem.category);
    }

    changeCategory(category: string) {
        this.updateItemVisibility(category);
    }

    updateItemVisibility(category: string) {
        this.items.forEach((item) => {
            const comps = item.getComponents(CategoryItem);
            item.active = comps.map((comp) => comp.category).includes(category);
        });
    }
}
