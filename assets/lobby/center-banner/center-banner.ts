import { Banner } from "sc-user-service-client/dist/lobby";
import AnalyticsManager, { TrackingAction, TrackingEvent } from "../../analytics/AnalyticsManager";
import CommonDialog from "../../common/_base/view-models/CommonDialog";
import GameUtils from "../../common/GameUtils";
import { uiManager } from "../../managers/GameUIManager";
import { InternalEvents } from "../../managers/InternalEvents";
import LobbyDialogManager from "../../managers/LobbyDialogManager";
import { StorageManager } from "../../managers/StorageManager";
import { STORAGE_KEYS } from "./center-banner-container";
import CenterBannerItem from "./center-banner-item";

const { ccclass, property } = cc._decorator;
export type BannerItemData = Banner & {
    spriteFrame: cc.SpriteFrame;
};

@ccclass
export default class CenterBanner extends cc.Component {
    @property(cc.Sprite)
    banner: cc.Sprite = null;

    @property(cc.Toggle)
    toggleDontShowAgain: cc.Toggle = null;

    @property(cc.PageView)
    pageView: cc.PageView = null;

    @property(cc.Prefab)
    bannerItemPrefab: cc.Prefab = null;

    private dialog: CommonDialog = null;
    private banners: BannerItemData[] = [];
    private originalBannerCount = 0;
    private isInfiniteScrolling = false;
    private readonly TRACKING_OBJECT_NAME = "Center Banner";

    onLoad() {
        this.dialog = this.getComponentInChildren(CommonDialog);
        this.dialog.addOnDidHide(() => {
            this.stopAutoSlide();
            this.node.destroy();
        });

        AnalyticsManager.Instance.trackEvent(TrackingEvent.Button, {
            location: cc.director.getScene().name,
            action: TrackingAction.Show,
            object_name: this.TRACKING_OBJECT_NAME
        });
    }

    onDestroy() {
        this.stopAutoSlide();
    }

    init(banners: BannerItemData[]) {
        this.banners = banners;
        this.originalBannerCount = banners.length;
        this.initPageView();
        this.startAutoSlide();
    }

    onChangeToggleDontShowAgain() {
        this.updateDontShowAgain();

        AnalyticsManager.Instance.trackEvent(TrackingEvent.Button, {
            location: cc.director.getScene().name,
            action: this.toggleDontShowAgain.isChecked ? TrackingAction.ToggleOn : TrackingAction.ToggleOff,
            object_name: this.TRACKING_OBJECT_NAME
        });
    }

    private updateDontShowAgain() {
        const isChecked = this.toggleDontShowAgain.isChecked;
        const key = GameUtils.keyStorageWithUserID(STORAGE_KEYS.DO_NOT_SHOW_CENTER_BANNER_AGAIN);
        StorageManager.set(key, isChecked);
    }

    closeBanner() {
        this.dialog.closeDialog(true);
        LobbyDialogManager.getInstance().onCloseDialog();
    }

    playNow() {
        this.closeBanner();
        const currentIndex = this.pageView.getCurrentPageIndex();
        const realBannerIndex = this.getRealBannerIndex(currentIndex);
        const gameId = this.banners[realBannerIndex].gameId;
        uiManager.emitter.emit(InternalEvents.OPEN_GAME, gameId);
        AnalyticsManager.Instance.trackEvent(TrackingEvent.Button, {
            location: cc.director.getScene().name,
            action: TrackingAction.Click,
            object_name: this.TRACKING_OBJECT_NAME
        });
    }

    private initPageView() {
        // Create pages for infinite scrolling
        this.createInfinitePages();
        this.initIndicator();
        this.pageView.node.on("page-turning", this.onPageTurning, this);
        this.pageView.node.on("scroll-ended", this.onScrollEnded, this);
    }

    private createInfinitePages() {
        // Clear existing pages
        this.pageView.removeAllPages();

        if (this.originalBannerCount <= 1) {
            // No infinite scrolling needed for single banner
            this.isInfiniteScrolling = false;
            const banner = this.banners[0];
            const page = this.createBannerPage(banner);
            this.pageView.addPage(page);
            return;
        }

        this.isInfiniteScrolling = true;

        // Structure: [last, first, second, ..., last, first]
        // Add last banner as first page (for seamless transition from first to last)
        const lastBanner = this.banners[this.originalBannerCount - 1];
        const firstDuplicatePage = this.createBannerPage(lastBanner);
        this.pageView.addPage(firstDuplicatePage);

        // Add all original banners
        for (const banner of this.banners) {
            const page = this.createBannerPage(banner);
            this.pageView.addPage(page);
        }
        // Add first banner as last page (for seamless transition from last to first)
        const firstBanner = this.banners[0];
        const lastDuplicatePage = this.createBannerPage(firstBanner);
        this.pageView.addPage(lastDuplicatePage);

        const layout = this.pageView.content.getComponent(cc.Layout);
        layout.updateLayout();

        this.pageView.scrollToPage(1, 0);
        this.pageView.setCurrentPageIndex(1);
    }

    private createBannerPage(banner: BannerItemData): cc.Node {
        const page = cc.instantiate(this.bannerItemPrefab);
        const bannerItem = page.getComponent(CenterBannerItem);
        bannerItem.onCloseBanner = () => {
            this.closeBanner();
        };
        bannerItem.init(banner.gameId, banner.spriteFrame);
        return page;
    }

    private getRealBannerIndex(pageIndex: number): number {
        if (!this.isInfiniteScrolling) {
            return pageIndex;
        }

        // Convert page index to real banner index
        if (pageIndex === 0) {
            // First duplicate page (last banner)
            return this.originalBannerCount - 1;
        } else if (pageIndex === this.originalBannerCount + 1) {
            // Last duplicate page (first banner)
            return 0;
        } else {
            // Real pages are at indices 1 to originalBannerCount
            return pageIndex - 1;
        }
    }

    private onScrollEnded() {
        if (!this.isInfiniteScrolling) {
            return;
        }

        const currentIndex = this.pageView.getCurrentPageIndex();
        const totalPages = this.pageView.getPages().length;

        // Handle infinite scrolling transitions
        if (currentIndex === 0) {
            // At first duplicate page (last banner), jump to real last page
            this.pageView.scrollToPage(this.originalBannerCount, 0);
        } else if (currentIndex === totalPages - 1) {
            // At last duplicate page (first banner), jump to real first page
            this.pageView.scrollToPage(1, 0);
        }
    }

    onIndicatorClick() {
        this.restartAutoSlide();
    }

    private initIndicator() {
        if (this.originalBannerCount <= 1) {
            this.pageView.indicator.node.active = false;
            return;
        }

        // Create indicators only for real banners
        const indicatorParent = this.pageView.indicator.node;

        // Remove existing indicators
        indicatorParent.removeAllChildren();

        // Create new indicators for each real banner
        for (let i = 0; i < this.originalBannerCount; i++) {
            const indicatorNode = new cc.Node();
            indicatorNode.addComponent(cc.Sprite).spriteFrame = this.pageView.indicator.spriteFrame;
            indicatorNode.width = this.pageView.indicator.cellSize.width;
            indicatorNode.height = this.pageView.indicator.cellSize.height;

            const button = indicatorNode.addComponent(cc.Button);
            button.node.on("click", () => {
                const targetIndex = this.isInfiniteScrolling ? i + 1 : i;
                this.pageView.scrollToPage(targetIndex, 1);
                this.restartAutoSlide();
            });

            indicatorParent.addChild(indicatorNode);
        }

        this.updateIndicatorDisplay();
    }

    private updateIndicatorDisplay() {
        if (this.originalBannerCount <= 1) {
            return;
        }

        const currentIndex = this.pageView.getCurrentPageIndex();
        const realIndex = this.getRealBannerIndex(currentIndex);
        const indicators = this.pageView.indicator.node.children;

        indicators.forEach((indicator, index) => {
            indicator.opacity = index === realIndex ? 255 : 128;
        });
    }

    private nextBanner() {
        const currentIndex = this.pageView.getCurrentPageIndex();
        const totalPages = this.pageView.getPages().length;
        const nextIndex = currentIndex + 1;

        if (nextIndex >= totalPages) {
            // This shouldn't happen with infinite scrolling, but just in case
            this.pageView.scrollToPage(this.isInfiniteScrolling ? 1 : 0, 1);
        } else {
            this.pageView.scrollToPage(nextIndex, 1);
        }
    }

    private startAutoSlide() {
        if (this.originalBannerCount <= 1) {
            return;
        }
        this.stopAutoSlide();
        this.scheduleNextSlide();
    }

    private scheduleNextSlide() {
        const currentIndex = this.pageView.getCurrentPageIndex();
        const realIndex = this.getRealBannerIndex(currentIndex);
        const currentBanner = this.banners[realIndex];

        let displayTime = 5;
        if (currentBanner?.displayTime > 0) {
            displayTime = currentBanner.displayTime;
        }
        this.schedule(this.autoSlideCallback, displayTime);
    }

    private autoSlideCallback() {
        this.nextBanner();
        this.scheduleNextSlide();
    }

    private stopAutoSlide() {
        this.unschedule(this.autoSlideCallback);
    }

    private restartAutoSlide() {
        this.stopAutoSlide();
        this.scheduleNextSlide();
    }

    private onPageTurning() {
        this.updateIndicatorDisplay();
        this.restartAutoSlide();
    }
}
