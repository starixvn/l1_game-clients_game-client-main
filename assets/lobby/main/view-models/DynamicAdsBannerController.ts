import { lazyInject } from "../../../Application";
import GameUtils, { BannerType } from "../../../common/GameUtils";
import { uiManager } from "../../../managers/GameUIManager";
import BannerController from "./BannerController";
import BannerItem from "./BannerItem";
import LobbyMenuConfig from "./LobbyMenuConfig";
import SkeletonBanner from "./SkeletonBanner";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DynamicAdsBannerController extends BannerController {
    @property(cc.Prefab)
    adsItemPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    adsSpineItemPrefab: cc.Prefab = null;

    @lazyInject(LobbyMenuConfig)
    private readonly lobbyMenuConfig: LobbyMenuConfig;
    private isFirstLoad = false;

    async setGameAds(games: number[]) {
        let index = 0;
        this.destroyAllBanners();
        this.clearAutoChange();
        try {
            for (const gameId of games) {
                if (uiManager.isPauseLoadingIcons) {
                    return;
                }
                console.log("add banner------id---", gameId);

                await GameUtils.asyncExecute(this?.node, this.createAdsItem(gameId));
                this.handleShowFirstPage(index);
                index++;
            }
        } catch (e) {}
    }

    handleShowFirstPage = (index: number) => {
        if (index === 0) {
            this.showFirstPage();
        }
    };

    private triggerTouch() {
        if (this.node.childrenCount > 0 && !this.isFirstLoad) {
            this.enableTouch();
            this.isFirstLoad = true;
        }
    }

    protected async createAdsItem(id: number) {
        try {
            const bannerType = GameUtils.getBannerTypeByGameId(id);
            if (bannerType === BannerType.Prefab) {
                if (this.adsSpineItemPrefab) {
                    const item = cc.instantiate(this.adsSpineItemPrefab);
                    if (item) {
                        await this.createBannerWithAnimation(id, item);
                        this.setupButtonAndHandleShowBanner(item, id);
                    }
                }
            } else {
                const bannerSpriteFrame = await GameUtils.asyncExecute(this?.node, GameUtils.getStaticBanner(id));
                if (bannerSpriteFrame && this.adsItemPrefab) {
                    const item = cc.instantiate(this.adsItemPrefab);
                    if (item) {
                        this.createBanner(id, bannerSpriteFrame, item);
                        this.setupButtonAndHandleShowBanner(item, id);
                    }
                }
            }
        } catch (e) {
            console.warn("Catch error after await method", e.message);
        }
    }

    protected setupButtonAndHandleShowBanner(item: cc.Node, id: number) {
        const button = item.getComponent(cc.Button);
        const event = new cc.Component.EventHandler();
        event.target = this.node;
        event.component = "BannerController";
        event.handler = "openGame";
        event.customEventData = id.toString();
        button.clickEvents.push(event);

        this.triggerTouch();
    }

    destroyAllBanners() {
        this.node.removeAllChildren();
    }

    private createBanner(id: number, spriteFrame: cc.SpriteFrame, item: cc.Node) {
        const sprite = item.getComponent(cc.Sprite);
        this.node?.addChild(item);
        sprite.spriteFrame = spriteFrame;

        const bannerItem = item.getComponent(BannerItem);
        const adsInfo = this.lobbyMenuConfig.getBannerInfo(id);

        if (adsInfo) {
            bannerItem.displayTime = adsInfo.displayTime;
        } else {
            bannerItem.displayTime = 4;
        }
    }

    protected async createBannerWithAnimation(id: number, item: cc.Node) {
        this.node?.addChild(item);

        const bannerItem = item.getComponent(BannerItem);
        const adsInfo = this.lobbyMenuConfig.getBannerInfo(id);

        if (adsInfo) {
            bannerItem.displayTime = adsInfo.displayTime;
        } else {
            bannerItem.displayTime = 4;
        }
        const skeletonBannerIcon = item.getComponent(SkeletonBanner);
        await skeletonBannerIcon.loadAnimation(id);
    }

    onLoad() {
        // override to delay enableTouch
    }
}
