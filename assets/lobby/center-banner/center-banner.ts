import { Banner } from "sc-user-service-client/dist/lobby";
import AnalyticsManager, { TrackingAction, TrackingEvent } from "../../analytics/AnalyticsManager";
import CommonDialog from "../../common/_base/view-models/CommonDialog";
import { uiManager } from "../../managers/GameUIManager";
import { InternalEvents } from "../../managers/InternalEvents";
import LobbyDialogManager from "../../managers/LobbyDialogManager";
import { StorageManager } from "../../managers/StorageManager";
import CenterBannerIndicator from "./center-banner-indicator";
import CenterBannerItem from "./center-banner-item";

const { ccclass, property } = cc._decorator;
export type BannerItemData = Banner & {
    spriteFrame: cc.SpriteFrame;
};
export const CENTER_BANNER_DONT_SHOW_STORAGE_KEY = "center-banner-dont-show-again";
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
    private readonly TRACKING_OBJECT_NAME = "Center Banner";
    private autoSlideTimer: any = null;

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
        StorageManager.set(CENTER_BANNER_DONT_SHOW_STORAGE_KEY, isChecked);
    }

    closeBanner() {
        this.dialog.closeDialog(true);
        LobbyDialogManager.getInstance().onCloseDialog();
        this.updateDontShowAgain();
    }

    playNow() {
        this.closeBanner();
        const gameId = this.banners[this.pageView.getCurrentPageIndex()].gameId;
        uiManager.emitter.emit(InternalEvents.OPEN_GAME, gameId);
        AnalyticsManager.Instance.trackEvent(TrackingEvent.Button, {
            location: cc.director.getScene().name,
            action: TrackingAction.Click,
            object_name: this.TRACKING_OBJECT_NAME
        });
    }

    private initPageView() {
        for (const banner of this.banners) {
            const page = cc.instantiate(this.bannerItemPrefab);
            const bannerItem = page.getComponent(CenterBannerItem);
            bannerItem.onCloseBanner = () => {
                this.closeBanner();
            };
            bannerItem.init(banner.gameId, banner.spriteFrame);
            this.pageView.addPage(page);
        }
        this.initIndicator();

        this.pageView.node.on('page-turning', this.onPageTurning, this);
    }

    onIndicatorClick() {
        this.restartAutoSlide();
    }

    private initIndicator() {
        if (this.banners.length <= 1) {
            this.pageView.indicator.node.active = false;
            return;
        }
        this.pageView.indicator.node.children.forEach((child) => {
            const button = child.addComponent(cc.Button);
            child.addComponent(CenterBannerIndicator);
            const event = new cc.Component.EventHandler();
            event.target = child;
            event.component = "CenterBannerIndicator";
            event.handler = "onClick";
            button.clickEvents.push(event);
        });
    }

    private nextBanner() {
        const currentIndex = this.pageView.getCurrentPageIndex();
        const totalPages = this.pageView.getPages().length;
        const nextIndex = currentIndex === totalPages - 1 ? 0 : currentIndex + 1;
        this.pageView.scrollToPage(nextIndex, 0);
    }

    private startAutoSlide() {
        if (this.banners.length <= 1) {
            return;
        }
        
        this.stopAutoSlide();
        this.scheduleNextSlide();
    }

    private scheduleNextSlide() {
        const currentIndex = this.pageView.getCurrentPageIndex();
        const currentBanner = this.banners[currentIndex];
        
        if (currentBanner && currentBanner.displayTime > 0) {
            this.autoSlideTimer = setTimeout(() => {
                this.nextBanner();
                this.scheduleNextSlide();
            }, currentBanner.displayTime * 1000);
        }
    }

    private stopAutoSlide() {
        if (this.autoSlideTimer !== null) {
            clearTimeout(this.autoSlideTimer);
            this.autoSlideTimer = null;
        }
    }

    private restartAutoSlide() {
        this.stopAutoSlide();
        this.scheduleNextSlide();
    }

    private onPageTurning() {
        this.restartAutoSlide();
    }
}
