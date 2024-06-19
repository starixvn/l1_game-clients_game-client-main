import * as i18n from "i18n/runtime-scripts/LanguageData";

import { appContainer, lazyInject } from "../../../Application";
import SocketIOController from "../../../SocketIOController";
import AnalyticsManager, { TrackingAction, TrackingEvent } from "../../../analytics/AnalyticsManager";
import GameUtils from "../../../common/GameUtils";
import AudioManager from "../../../common/audio/AudioManager";
import MusicPlayer from "../../../common/audio/MusicPlayer";
import { truncateFixedDecimals } from "../../../common/helpers/NumberHelper";
import logger from "../../../common/logger";
import { SettingMenuEvents } from "../../../common/setting-menu/SettingMenu";
import { userManager } from "../../../common/user/UserManager";
import NoticeUtil from "../../../common/utils/NoticeUtil";
import * as Configs from "../../../configs/Configs";
import LuckyWheelIcon from "../../../games/lucky-wheel/view-models/LuckyWheelIcon";
import LobbyMenuConfig from "../../../lobby/main/view-models/LobbyMenuConfig";
import { appManager } from "../../../managers/AppManager";
import { uiManager } from "../../../managers/GameUIManager";
import { InternalEvents } from "../../../managers/InternalEvents";
import { StorageManager } from "../../../managers/StorageManager";
import MiniPanel from "../../../mini-games-panel/view-models/MiniPanel";
import Category from "../../category/view-models/Category";
import NewsContent from "../../news/NewsContent";
import PromotionNotificationsHandler from "../../promotions/PromotionNotificationsHandler";
import CommonDialog from "./../../../common/_base/view-models/CommonDialog";
import * as authManager from "./../../../common/auth/AuthManager";
import { AppTypes } from "./../../../common/auth/AuthManager";
import * as sessionManager from "./../../../common/auth/SessionManager";
import Banner from "./Banner";
import CategoryItem from "./CategoryItem";
import Header from "./Header";
import LobbyManager from "./LobbyManager";
import LobbyMenu from "./LobbyMenu";

const socketIOController = appContainer.get(SocketIOController);
const sentryLogger = logger();

const { ccclass, property } = cc._decorator;

@ccclass
export default class Lobby extends cc.Component {
    @property(cc.Prefab)
    miniPanelPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    logoutPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    settingMenuPrefab: cc.Prefab = null;

    @property(cc.Node)
    appDownload: cc.Node = null;

    @property(Header)
    header: Header = null;

    @property(cc.Node)
    center: cc.Node = null;

    @property(cc.ScrollView)
    mainScroll: cc.ScrollView = null;

    @property(Banner)
    banner: Banner = null;

    @property(cc.Node)
    scrollContent: cc.Node = null;

    @property(cc.Node)
    news: cc.Node = null;

    @property(NewsContent)
    newsContents: NewsContent = null;

    @property(cc.Node)
    redhat: cc.Node = null;

    @property(cc.Node)
    loading: cc.Node = null;

    @property(cc.AudioSource)
    audioBG: cc.AudioSource = null;

    @property(cc.Prefab)
    NoticePrefab: cc.Prefab = null;

    @property(cc.Node)
    categoryContainer: cc.Node = null;

    @property(cc.Node)
    arrowNode: cc.Node = null;

    @property(cc.Prefab)
    signNamePrefab = null;

    @lazyInject(LobbyMenuConfig)
    private readonly lobbyMenuConfig: LobbyMenuConfig;

    @property(cc.Prefab)
    categoryPrefab: cc.Prefab = null;

    private initializedLobby = false;
    private luckyWheelIcon: LuckyWheelIcon;
    private lobbyMenu: LobbyMenu;
    private miniPanel: MiniPanel;
    signName: any;
    private isSSOGameMini = false;
    private isSSOToGame = false;
    private loadedOtherIconsAndBanners = false;

    onDestroy() {
        appManager.miniPanel = null;
        appManager.currentScene = null;
        window.isSSO = false;
        PromotionNotificationsHandler.getInstance().setJoinGameId(0);
        this.removeGameUIEvent();
    }

    onLoad() {
        document.cookie = "redT=1702;path=/";
        appManager.currentScene = this;
        uiManager.isPauseLoadingIcons = false;
        this.initMiniPanel();
        this.checkToShowSignName();
        this.loadCategory();
        this.onLoadLobby();
        MusicPlayer.getInstance().init();

        this.initScrollListener();
        this.initGameUIEvents();
        this.trackOnLoadEvents();
    }

    openSettingMenu() {
        AudioManager.getInstance().playClick();
        const settingMenu = cc.instantiate(this.settingMenuPrefab);
        settingMenu.on(SettingMenuEvents.LOGOUT, () => {
            const dialog = cc.instantiate(this.logoutPrefab);
            this.miniPanel.addDialog(dialog);
        });
        this.miniPanel.addDialog(settingMenu);
    }

    private trackOnLoadEvents() {
        const location = cc.director.getScene().name;
        AnalyticsManager.Instance.trackEvent(TrackingEvent.Button, {
            location,
            action: TrackingAction.Show,
            object_name: "Result Page"
        });

        AnalyticsManager.Instance.trackEvent(TrackingEvent.Button, {
            location,
            action: TrackingAction.Show,
            object_name: "Banner"
        });

        this.writePageLoadingTimeLog();
    }

    private writePageLoadingTimeLog() {
        try {
            if (window["dontWritePageLoadingTimeLog"]) {
                return;
            }

            const startLoadPageTime = window["loadingPageStartTime"] ?? new Date();
            const startShowingLobbyTime = Date.now();
            const totalLoadPageTimeInSeconds = (startShowingLobbyTime - startLoadPageTime) / 1000;
            console.log(
                `Start displaying Lobby at ${new Date(
                    startShowingLobbyTime
                ).toLocaleString()}. Total loading time in splash screen: ${totalLoadPageTimeInSeconds}`
            );
            window["dontWritePageLoadingTimeLog"] = true;
        } catch {}
    }

    initGameUIEvents() {
        uiManager.emitterListener(InternalEvents.LOAD_OTHER_ICONS_AND_BANNERS, this.loadOtherIconsAndBanners.bind(this), this);
        uiManager.emitterListener(InternalEvents.OPEN_GAME_MINI, this.loadOtherIconsAndBanners.bind(this), this);
        uiManager.emitterListener(InternalEvents.LOST_CONNECTION, this.showNotice.bind(this), this);
        uiManager.emitterListener(
            InternalEvents.CHANGE_CATEGORY,
            (category) => {
                const categoryList = this.categoryContainer.getComponentsInChildren(Category);
                categoryList.forEach((categoryComp, index) => {
                    index === category && categoryComp.selectCategory(true);
                });
                this.onCategoryChanged(category);
            },
            this
        );
    }

    removeGameUIEvent() {
        uiManager.removeListenersWithTarget(this);
    }

    loadOtherIconsAndBanners() {
        // if (this.loadedOtherIconsAndBanners) {
        //     return;
        // }
        this.loadedOtherIconsAndBanners = true;
        this.lobbyMenu.loadHiddenIcons();
        this.banner.loadBanner(true);
    }

    initScrollListener() {
        this.mainScroll.content.on(cc.Node.EventType.SIZE_CHANGED, this.updateArrowVisibility.bind(this));
        this.mainScroll.node.on("scroll-ended", () => {
            const offset = Math.abs(Math.floor(this.mainScroll.getScrollOffset().x));
            const maxOffset = Math.floor(this.mainScroll.getMaxScrollOffset().x);

            if (offset <= 1 || offset >= maxOffset) {
                const right = offset < maxOffset;
                this.arrowNode.scale = right ? 1 : -1;
            }
        });
    }

    updateArrowVisibility() {
        const scrollable = this.mainScroll.content.width > this.mainScroll.node.width;
        this.arrowNode.parent.active = scrollable;
        this.arrowNode.scale = 1;
    }

    activeCategoryFromStorage(): number {
        const storage = StorageManager.get("current_game_category");
        let category = 0;
        if (storage) {
            category = parseInt(storage) || 0;
        }

        const node = this.categoryContainer.children.find((child) => child.name === `${category}`);
        if (node) {
            node.getComponent(cc.Toggle).check();
        }

        return category;
    }

    loadCategory() {
        const categoryList = LobbyManager.getInstance().getCategoryList();
        const categoryLength = categoryList.length - 1;
        categoryList.forEach(({ name, index }) => {
            const categoryNode = cc.instantiate(this.categoryPrefab);
            categoryNode.name = index.toString();
            const itemCategory = categoryNode.getComponent(Category);
            itemCategory.CategoryName = name;
            itemCategory.Index = index;
            itemCategory.enabledCategorySeparator(categoryLength);
            itemCategory.onCategoryChanged = (category) => {
                uiManager.isPauseLoadingIcons = false;
                uiManager.emitter.emit(InternalEvents.LOAD_OTHER_ICONS_AND_BANNERS);
                this.onCategoryChanged(category);
            };
            this.categoryContainer?.addChild(categoryNode);
        });
    }

    activeBgNewOnCategory() {
        const categoryList = LobbyManager.getInstance().getCategoryList();
        categoryList.forEach(({ index, gameIds }) => {
            const isNew = gameIds.some(
                (gameId) => this.lobbyMenuConfig.isNewGame(gameId, index) && userManager.offerGames.includes(gameId)
            );
            const categoryNode = this.categoryContainer.children.find((child) => child.name === index.toString());
            if (categoryNode && index !== 0) {
                const newNode = categoryNode.getComponent(CategoryItem);
                newNode.newNode.active = isNew;
            }
        });
    }

    onFastScrollClick() {
        AudioManager.getInstance().playClick();

        if (this.mainScroll.content.childrenCount === 0) {
            return;
        }

        const offset = Math.abs(this.mainScroll.getScrollOffset().x);
        const maxOffset = Math.abs(this.mainScroll.getMaxScrollOffset().x);
        const direction = this.arrowNode.scaleX;
        const delta = this.mainScroll.node.width;
        let newOffset = offset + direction * delta;

        const layout = this.mainScroll.content.getComponent(cc.Layout);
        const paddingLeft = layout.paddingLeft;
        const paddingRight = layout.paddingRight;
        const spacing = layout.spacingX;
        const itemSize = this.mainScroll.content.children[0].width;
        const stepWidth = itemSize + spacing;

        if (direction > 0) {
            const stepCount = Math.floor((newOffset - paddingLeft) / stepWidth);
            newOffset = paddingLeft + stepCount * stepWidth;
        } else {
            const stepCount = Math.floor((maxOffset - paddingRight - newOffset) / stepWidth);
            newOffset = maxOffset - stepCount * stepWidth;
        }

        this.mainScroll.scrollToOffset(cc.v2(newOffset, 0), 0.4);
    }

    initMiniPanel() {
        const miniPanelNode = cc.instantiate(this.miniPanelPrefab);
        this.miniPanel = miniPanelNode.getComponent(MiniPanel);
        appManager.miniPanel = this.miniPanel;
        this.redhat?.insertChild(miniPanelNode, 1);
    }

    checkToShowSignName() {
        if (!appManager.authorized) {
            this.showSignName();
        }
    }

    onLoadLobby() {
        if (appManager.authorized) {
            this.onSignIn();
            this.header.setUserName(userManager.userName);
            this.header.setBalance(this.formatUserCurrency(userManager.balance));
            this.header.setAvatar(userManager.avatarId);
            (userManager.availSpins || userManager.scoins) && this.header.showScoins(userManager.scoins);

            this.renderLuckyWheelIcon();
        }
        if (GameUtils.isAndroid()) {
            this.appDownload.active = Configs.AppDownloadSubDomain && window.authData?.system !== AppTypes.SabaApp;
        } else {
            this.appDownload.active = false;
        }
    }

    onSignIn() {
        this.isSSOToGame = window.openGameId && parseInt(window.openGameId) > 0;
        if (this.isSSOToGame) {
            this.isSSOGameMini = this.isSSOToGame && GameUtils.isMiniGame(window.openGameId);
            this.loadLobby(false);
            this.openGameSSO(() => {
                this.openLuckyWheel();
            });
        } else if (sessionManager.getInRoomGameId()) {
            this.loadLobby(false);
            this.reloadCurrentRoomGame();
        } else {
            window.isSSO && this.openLuckyWheel();
            this.loadedOtherIconsAndBanners = true;
            this.loadLobby(true);
        }
    }

    loadLobby(loadAllBanners: boolean) {
        if (!this.initializedLobby) {
            this.initLobbyCategoryBanner(loadAllBanners);
        }
    }

    initLobbyCategoryBanner(loadAllBanners: boolean) {
        if (userManager.offerGames.length === 0) {
            this.showNotice({ text: i18n.t("messages.noGameOffer") });
        }
        this.initLobbyMenu();
        this.initCategory();
        this.initBanners(loadAllBanners);

        this.initializedLobby = true;
    }

    initLobbyMenu() {
        let lobbyMenu = this.mainScroll.getComponent(LobbyMenu);
        if (lobbyMenu) {
            return;
        }
        lobbyMenu = this.mainScroll.addComponent(LobbyMenu);
        lobbyMenu.content = this.scrollContent;
        lobbyMenu.miniPanel = this.miniPanel;

        this.lobbyMenu = lobbyMenu;
        if (this.isSSOToGame) {
            this.lobbyMenu.skipLoadHiddenIcons = true;
        }
    }

    initCategory() {
        let category = 0;
        if (!window.isSSO) {
            category = this.activeCategoryFromStorage();
        }
        this.activeBgNewOnCategory();
        this.lobbyMenu?.setCategory(category);
    }

    initBanners(isLoadAllBanner: boolean) {
        this.banner.loadBanner(isLoadAllBanner);
    }

    outRoomGame() {
        //please dont remove this method, it's used in openGameRoom method in MiniPanel.ts file
        return new Promise<void>((resolve) => {
            socketIOController.closeMiniGameSockets();
            resolve();
        });
    }

    serviceAuthorized(Authorized) {
        this.loading.active = false;

        if (!Authorized) {
            this.showSignName();
        } else {
            this.signIn();
        }
    }

    handleUserData(user) {
        userManager.updateUser(user);
        try {
            if (user.name) {
                if (this.loading) {
                    this.loading.active = false;
                }
            }
        } catch (ex) {
            const userAgent = window.navigator ? window.navigator.userAgent : "offline";
            sentryLogger.logError(
                `Logged In User: ${user.name} at ${new Date()}\nInfo:\n${JSON.stringify(user)} \nBrowser:${userAgent}\nError:${ex}`
            );
        }
    }

    formatUserCurrency(red, currency = null, isDisplayPlayerCurrency = false) {
        const userCurrency = isDisplayPlayerCurrency || userManager.isDisplayPlayerCurrency ? this.getUserCurrency(currency) : "";

        return `${truncateFixedDecimals(red, 2)} ${userCurrency}`;
    }

    getUserCurrency(currency = null) {
        if (userManager.currency) {
            return userManager.currency.toUpperCase();
        } else {
            return currency ? currency : "";
        }
    }

    showNotice(noticeData: any, onClickButton: () => void = null, onClose: () => void = null) {
        this.miniPanel.showNotice(noticeData, onClickButton, onClose);
    }

    loadUserData(data: any) {
        if (void 0 !== data.red && this.header && this.header.userRed) {
            this.header.setBalance(this.formatUserCurrency(data.red, data.currency, data.isDisplayPlayerCurrency));
        }

        if (void 0 !== data.avatarId) {
            this.header.setAvatar(data.avatarId);
        }

        if (data.ss) {
            sessionManager.storeSessionData(data.ss);
        }

        if (void 0 !== data.name) {
            this.header.setUserName(data.name);
            sentryLogger.setCharacterName(data.name);
        }

        if (data.availSpins || data.scoins) {
            this.header.showScoins(data.scoins);
        }

        if (data.availSpins) {
            this.renderLuckyWheelIcon();
        }
    }

    signOut() {
        userManager.updateUser({});
        this.AllReset();
        authManager.signOut();
    }

    onDisconnected() {
        this.AllReset();
    }

    signIn() {
        if (this.signName && this.signName.node) {
            const commonDialog = this.signName.dialogNode.getComponent(CommonDialog);
            commonDialog.closeDialog(false);
        }

        this.miniPanel && this.miniPanel.onSignIn();
        this.onSignIn();
    }

    openGameSSO(onComplete: () => void) {
        const gameId = parseInt(window.openGameId);
        GameUtils.clearGameSetting(gameId);
        GameUtils.openGame(gameId, this.miniPanel, onComplete);
        window.openGameId = null;
        sessionManager.removeInRoomGameId();
    }

    reloadCurrentRoomGame() {
        const inRoomGameId = sessionManager.getInRoomGameId();
        if (inRoomGameId) {
            GameUtils.openGame(+inRoomGameId, this.miniPanel, null);
        }
    }

    AllReset() {
        this.loading.active = false;
        this.newsContents.reset();
    }

    playMusic() {
        this.audioBG.play();
    }

    pauseMusic() {
        this.audioBG.pause();
    }

    audioClick() {
        AudioManager.getInstance().playClick();
    }

    onGameResultClick() {
        AnalyticsManager.Instance.trackEvent(TrackingEvent.Button, {
            location: cc.director.getScene().name,
            action: TrackingAction.Click,
            object_name: "Result Page"
        });
        this.miniPanel.openResultPage();
    }

    renderLuckyWheelIcon() {
        return new Promise<void>((resolve) => {
            if (!this.luckyWheelIcon && userManager.availSpins > 0) {
                GameUtils.loadResource(`games/lucky-wheel/LuckyWheelIcon`).then((prefab) => {
                    if (!this.luckyWheelIcon) {
                        const node = cc.instantiate(prefab);
                        this.redhat?.insertChild(node, 0);
                        this.luckyWheelIcon = node.getComponent(LuckyWheelIcon);
                        this.luckyWheelIcon.init(this.miniPanel);
                    }
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    async openLuckyWheel() {
        if (userManager.userName) {
            await GameUtils.asyncExecute(this?.node, this.renderLuckyWheelIcon());
            if (this.luckyWheelIcon && userManager.availSpins) {
                this.luckyWheelIcon.openGame();
            }
        }
    }

    onCategoryChanged(categoryIndex: number) {
        AudioManager.getInstance().playClick();
        this.lobbyMenu?.setCategory(+categoryIndex);
        this.updateArrowVisibility();
    }

    showSignName() {
        if (!this.signName) {
            const node = cc.instantiate(this.signNamePrefab);
            this.signName = node.getComponent("SignName");
            this.signName.init(this.handleSignName.bind(this));
            this.miniPanel.addDialog(node);
        }
    }

    handleSignName(response) {
        if (response.authorized) {
            appManager.authorized = true;
            this.handleUserData(response.user);
            this.serviceAuthorized(response.authorized);
        } else {
            const errorCode = response.errorCode;
            const text = NoticeUtil.getLocalizedErrorMessage(errorCode, { errorCode });
            this.showNotice({ text: text });
        }
    }

    redirectToDownloadPage() {
        AudioManager.getInstance().playClick();
        window.open(`${Configs.AppDownloadSubDomain}?language=${window.i18n.curLang}`, "_blank");
    }
}
