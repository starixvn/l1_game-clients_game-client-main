import CategoryItem from "./category-item";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CategoryController extends cc.Component {
    @property(cc.Node)
    container: cc.Node = null;

    _items: cc.Node[] = [];

    categories: string[] = [];

    get items(): cc.Node[] {
        if (this._items.length === 0) {
            this._items = this.container.children;
        }
        return this._items;
    }

    onToggleCategoryChanged(toggle: cc.Toggle) {
        const categoryItem = toggle.getComponent(CategoryItem);
        const isChecked = toggle.isChecked;

        this.changeCategory(categoryItem.category, isChecked);
    }

    initCategories(categories: string[]) {
        this.categories = categories;
        this.updateItemVisibility();
    }

    changeCategory(category: string, checked: boolean) {
        if (checked) {
            this.categories.push(category);
            this.removeDuplicateCategory();
        } else {
            const index = this.categories.indexOf(category);
            this.categories.splice(index);
        }
        console.log(`Categories updated: `, this.categories);
        this.updateItemVisibility();
    }

    private removeDuplicateCategory() {
        this.categories = this.categories.filter(
            (iterator, index, categories) => categories?.findIndex((category) => category === iterator) === index
        );
    }

    updateItemVisibility() {
        this.items.forEach((item) => {
            const comps = item.getComponents(CategoryItem);
            item.active = comps.some((comp) => this.categories.includes(comp.category));
        });
    }
}
