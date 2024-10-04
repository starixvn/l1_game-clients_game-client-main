import DynamicAdsBannerController from "../DynamicAdsBannerController";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DynamicAdsBannerThemeController extends DynamicAdsBannerController {
    @property({ type: cc.Prefab, override: true, visible: false })
    adsItemPrefab: cc.Prefab = null;

    protected override async createAdsItem(id: number) {
        try {
            if (this.adsSpineItemPrefab && id > 0) {
                const item = cc.instantiate(this.adsSpineItemPrefab);
                if (item) {
                    await this.createBannerWithAnimation(id, item);
                    this.setupButtonAndHandleShowBanner(item, id);
                }
            }
        } catch (e) {
            console.warn("Catch error after await method", e.message);
        }
    }
}
