import { Banner } from "sc-user-service-client/dist/lobby";
import { lazyInject } from "../../Application";
import { lodash } from "../../ClientModules";
import GameUtils from "../../common/GameUtils";
import { userManager } from "../../common/user/UserManager";
import { appManager } from "../../managers/AppManager";
import { uiManager } from "../../managers/GameUIManager";
import { InternalEvents } from "../../managers/InternalEvents";
import LobbyDialogManager from "../../managers/LobbyDialogManager";
import { StorageManager } from "../../managers/StorageManager";
import LobbyMenuConfig from "../main/view-models/LobbyMenuConfig";
import CenterBanner, { BannerItemData } from "./center-banner";
const { ccclass, property } = cc._decorator;

// Constants
export const STORAGE_KEYS = {
    SHOWED_CENTER_BANNERS: "SHOWED_CENTER_BANNERS",
    CENTER_BANNER_DONT_SHOW: "center-banner-dont-show-again"
};

@ccclass
export default class CenterBannerContainer extends cc.Component {
    @property(cc.Prefab)
    bannerPrefab: cc.Prefab = null;

    @lazyInject(LobbyMenuConfig)
    private readonly lobbyMenuConfig: LobbyMenuConfig;

    onLoad() {
        uiManager.emitterListener(
            InternalEvents.CENTER_BANNER_SHOW,
            () => LobbyDialogManager.getInstance().addDialog(this.initCenterBanner.bind(this), "CenterBanner"),
            this
        );
    }

    onDestroy(): void {
        uiManager.removeListenersWithTarget(this);
    }

    async initCenterBanner(): Promise<void> {
        try {
            this.updateHasShowedCenterBannerFlag();

            const banners = await this.loadBanners();

            if (this.shouldSkipBanners(banners)) {
                return;
            }

            if (this.shouldShowBanners(banners)) {
                this.showBanners(banners);
            }
        } catch (error) {
            this.handleBannerLoadError(error);
        }
    }

    private updateHasShowedCenterBannerFlag(): void {
        appManager.hasShowedCenterBanner = StorageManager.get(STORAGE_KEYS.CENTER_BANNER_DONT_SHOW) ?? false;
    }

    private shouldSkipBanners(banners: BannerItemData[]): boolean {
        return banners.length === 0;
    }

    private shouldShowBanners(banners: BannerItemData[]): boolean {
        if (!appManager.hasShowedCenterBanner) {
            return true;
        }

        return this.hasNewBannersToShow(banners);
    }

    private hasNewBannersToShow(banners: BannerItemData[]): boolean {
        const previouslyShowedBanners = this.getPreviouslyShowedBanners();

        if (!previouslyShowedBanners) {
            return true;
        }

        const currentBannersData = this.parseBannersToObject(banners);
        return !lodash.isEqual(currentBannersData, previouslyShowedBanners);
    }

    private getPreviouslyShowedBanners(): any {
        return StorageManager.get(STORAGE_KEYS.SHOWED_CENTER_BANNERS);
    }

    private handleBannerLoadError(error: any): void {
        console.error("Failed to load center banners:", error);
    }

    private parseBannersToObject(banners: BannerItemData[]) {
        return banners.map((banner) => ({
            gameId: banner.gameId,
        }));
    }

    private getFilteredBanners() {
        return this.lobbyMenuConfig.centerBanners.filter((banner) => userManager.offerGames.includes(banner.gameId));
    }

    private async loadBanners(): Promise<BannerItemData[]> {
        const filterList = this.getFilteredBanners();
        const bannerPromises = filterList.map((banner) => this.loadBannerData(banner));
        const results = await Promise.all(bannerPromises);

        return results.filter((result) => result !== null);
    }

    private async loadBannerData(banner: Banner): Promise<BannerItemData | null> {
        try {
            const path = `center-banners/${banner.gameId}`;
            const versionsPath = `${path}/versions.json`;
            const data = await GameUtils.loadRemoteFromSharedResource<any>(versionsPath, true);

            if (data) {
                const spriteFrame = await this.loadBannerImage(data, path);
                if (spriteFrame) {
                    return { ...banner, spriteFrame };
                }
            }
        } catch (e) {
            console.log("Can not load banner", banner.gameId);
        }

        return null;
    }

    private async loadBannerImage(data: any, path: string): Promise<cc.SpriteFrame | null> {
        const languages = [window.i18n.curLang, "en", "vi"];
        for (const lang of languages) {
            const fileName = `${lang}.webp`;
            if (data.json[fileName]) {
                const imageAsset = await GameUtils.loadRemoteFromSharedResource<cc.Texture2D>(`${path}/${fileName}`, true);
                if (imageAsset) {
                    const spriteFrame = new cc.SpriteFrame();
                    spriteFrame.setTexture(imageAsset);
                    return spriteFrame;
                }
            }
        }
        return null;
    }

    private saveBannersAsShowed(banners: BannerItemData[]): void {
        const bannersData = this.parseBannersToObject(banners);
        StorageManager.set(STORAGE_KEYS.SHOWED_CENTER_BANNERS, bannersData);
        appManager.hasShowedCenterBanner = true;
    }

    private showBanners(banners: BannerItemData[]): void {
        this.saveBannersAsShowed(banners);
        this.showCenterBanner(banners);
    }

    private showCenterBanner(banners: BannerItemData[]) {
        const node = cc.instantiate(this.bannerPrefab);
        const banner = node.getComponent(CenterBanner);
        banner.updateDontShowAgain();
        this.node.addChild(node);
        banner.init(banners);
    }
}
