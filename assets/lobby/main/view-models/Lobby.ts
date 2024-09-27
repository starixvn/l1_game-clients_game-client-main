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
import * as sessionManager from "./../../../common/auth/SessionManager";
import Banner from "./Banner";
import ButtonArrow from "./ButtonArrow";
import ButtonsLobby from "./ButtonsLobby";
import CategoryItem from "./CategoryItem";
import Header from "./Header";
import LobbyManager from "./LobbyManager";
import LobbyMenu from "./LobbyMenu";
import LobbyResourceManager from "./LobbyResourceManager";

const socketIOController = appContainer.get(SocketIOController);
const sentryLogger = logger();

const { ccclass, property } = cc._decorator;

@ccclass
export default class Lobby extends cc.Component {
    @property(cc.Prefab)
    miniPanelPrefab: cc.Prefab = null;

    @property(cc.ScrollView)
    mainScroll: cc.ScrollView = null;

    @property(Banner)
    banner: Banner = null;

    @property(cc.Node)
    scrollContent: cc.Node = null;

    @property(cc.Node)
    redhat: cc.Node = null;

    @property(cc.Node)
    loading: cc.Node = null;

    @property(cc.AudioSource)
    audioBG: cc.AudioSource = null;

    @property(cc.Node)
    categoryContainer: cc.Node = null;

    @lazyInject(LobbyMenuConfig)
    private readonly lobbyMenuConfig: LobbyMenuConfig;

    @property(cc.Prefab)
    categoryPrefab: cc.Prefab = null;

    @property(cc.Node)
    containerBackgroundUI: cc.Node = null;

    @property(cc.Node)
    containerHeader: cc.Node = null;

    @property(cc.Node)
    containerMarquee: cc.Node = null;

    @property(cc.Node)
    containerButtonArrow: cc.Node = null;

    @property(cc.Node)
    containerButtons: cc.Node = null;

    private initializedLobby = false;
    private luckyWheelIcon: LuckyWheelIcon;
    private lobbyMenu: LobbyMenu;
    private miniPanel: MiniPanel;
    signName: any;
    private isSSOToGame = false;
    logoutPrefab: cc.Prefab = null;
    settingMenuPrefab: cc.Prefab = null;
    signNamePrefab: cc.Prefab = null;
    marqueePrefab: cc.Prefab = null;
    headerPrefab: cc.Prefab = null;
    backgroundUIPrefab: cc.Prefab = null;
    buttonArrowPrefab: cc.Prefab = null;
    containerButtonsPrefabs: cc.Prefab = null;
    compHeader: Header = null;
    compNewsContents: NewsContent = null;
    compButtonArrow: ButtonArrow = null;

    onDestroy() {
        appManager.miniPanel = null;
        appManager.currentScene = null;
        window.isSSO = false;
        PromotionNotificationsHandler.getInstance().setJoinGameId(0);
        this.removeGameUIEvent();
    }

    async onLoad() {
        document.cookie = "redT=1702;path=/";
        appManager.currentScene = this;
        uiManager.isPauseLoadingIcons = false;
        await this.initUIs();
        this.initMiniPanel();
        this.checkToShowSignName();
        this.loadCategory();
        this.onLoadLobby();
        MusicPlayer.getInstance().init();

        this.initScrollListener();
        this.initGameUIEvents();
        this.trackOnLoadEvents();
    }

    async initUIs() {
        await this.loadBackgroundUI();
        await this.loadHeader();
        await this.loadMarquee();
        await this.loadButtonArrow();
        await this.loadButtons();
    }

    async loadBackgroundUI() {
        try {
            if (!this.backgroundUIPrefab) {
                this.backgroundUIPrefab = await LobbyResourceManager.loadResource("prefabs/backgroundUI");
            }

            if (this.backgroundUIPrefab) {
                const backgroundUI = cc.instantiate(this.backgroundUIPrefab);
                backgroundUI && this.containerBackgroundUI.addChild(backgroundUI);
            }
        } catch (err) {}
    }

    async loadHeader() {
        try {
            if (!this.headerPrefab) {
                this.headerPrefab = await LobbyResourceManager.loadResource("prefabs/header");
            }

            if (this.headerPrefab) {
                const header = cc.instantiate(this.headerPrefab);
                if (header) {
                    this.compHeader = header?.getComponent(Header);
                    this.containerHeader.addChild(header);
                }
            }
        } catch (err) {}
    }

    async loadMarquee() {
        try {
            if (!this.marqueePrefab) {
                this.marqueePrefab = await LobbyResourceManager.loadResource("prefabs/marquee");
            }

            if (this.marqueePrefab) {
                const marquee = cc.instantiate(this.marqueePrefab);
                if (marquee) {
                    this.compNewsContents = marquee?.getComponent(NewsContent);
                    this.containerMarquee.addChild(marquee);
                }
            }
        } catch (err) {}
    }

    async loadButtonArrow() {
        try {
            if (!this.buttonArrowPrefab) {
                this.buttonArrowPrefab = await LobbyResourceManager.loadResource("prefabs/buttonArrow");
            }

            if (this.buttonArrowPrefab) {
                const buttonArrow = cc.instantiate(this.buttonArrowPrefab);
                if (buttonArrow) {
                    buttonArrow.on("click", () => {
                        this.onFastScrollClick();
                    });
                    this.compButtonArrow = buttonArrow?.getComponent(ButtonArrow);
                    this.containerButtonArrow.addChild(buttonArrow);
                }
            }
        } catch (err) {}
    }

    async loadButtons() {
        try {
            if (!this.containerButtonsPrefabs) {
                this.containerButtonsPrefabs = await LobbyResourceManager.loadResource("prefabs/buttons");
            }

            if (this.containerButtonsPrefabs) {
                const buttons = cc.instantiate(this.containerButtonsPrefabs);
                const compButtonsLobby = buttons.getComponent(ButtonsLobby);
                compButtonsLobby.initClickEven(compButtonsLobby.downloadApp, this.node, "Lobby", "redirectToDownloadPage");
                compButtonsLobby.initClickEven(compButtonsLobby.settingMenu, this.node, "Lobby", "openSettingMenu");

                buttons && this.containerButtons.addChild(buttons);
            }
        } catch (err) {}
    }

    async openSettingMenu() {
        try {
            AudioManager.getInstance().playClick();
            if (!this.settingMenuPrefab) {
                this.settingMenuPrefab = await GameUtils.loadResource("prefabs/SettingMenu");
            }

            if (this.settingMenuPrefab) {
                const settingMenu = cc.instantiate(this.settingMenuPrefab);
                settingMenu.on(SettingMenuEvents.LOGOUT, async () => {
                    try {
                        if (!this.logoutPrefab) {
                            this.logoutPrefab = await GameUtils.loadResource("prefabs/LogoutPopup");
                        }

                        if (this.logoutPrefab) {
                            const dialog = cc.instantiate(this.logoutPrefab);
                            this.miniPanel.addDialog(dialog);
                        }
                    } catch (err) {}
                });
                this.miniPanel.addDialog(settingMenu);
            }
        } catch (err) {}
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
            cc.log(
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
        this.lobbyMenu.loadHiddenIcons();
        this.banner.loadBanner(true);
    }

    initScrollListener() {
        this.mainScroll.content.on(cc.Node.EventType.SIZE_CHANGED, () => {
            this.updateArrowVisibility();
        });
        this.mainScroll.node.on("scroll-ended", () => {
            const offset = Math.abs(Math.floor(this.mainScroll.getScrollOffset().x));
            const maxOffset = Math.floor(this.mainScroll.getMaxScrollOffset().x);

            if (offset <= 1 || offset >= maxOffset) {
                const right = offset < maxOffset;
                this.compButtonArrow?.handleScale(right);
            }
        });
    }

    updateArrowVisibility() {
        this.compButtonArrow?.updateArrowVisibility(this.mainScroll.content.width > this.mainScroll.node.width);
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
        const direction = this.compButtonArrow?.background?.scaleX;
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
            this.compHeader.setUserName(userManager.userName);
            this.compHeader.setBalance(this.formatUserCurrency(userManager.balance));
            this.compHeader.setAvatar(userManager.avatarId);
            (userManager.availSpins || userManager.scoins) && this.compHeader.showScoins(userManager.scoins);

            this.renderLuckyWheelIcon();
        }
    }

    onSignIn() {
        this.isSSOToGame = appManager.ssoGameId > 0;
        if (this.isSSOToGame) {
            this.loadLobby(false);
            this.openGameSSO(() => {
                this.openLuckyWheel();
            });
        } else if (sessionManager.getInRoomGameId()) {
            this.loadLobby(false);
            this.reloadCurrentRoomGame();
        } else {
            window.isSSO && this.openLuckyWheel();
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
        if (void 0 !== data.red && this.compHeader && this.compHeader.userRed) {
            this.compHeader.setBalance(this.formatUserCurrency(data.red, data.currency, data.isDisplayPlayerCurrency));
        }

        if (void 0 !== data.avatarId) {
            this.compHeader.setAvatar(data.avatarId);
        }

        if (data.ss) {
            sessionManager.storeSessionData(data.ss);
        }

        if (void 0 !== data.name) {
            this.compHeader.setUserName(data.name);
            sentryLogger.setCharacterName(data.name);
        }

        if (data.availSpins || data.scoins) {
            this.compHeader.showScoins(data.scoins);
        }

        if (data.availSpins) {
            this.renderLuckyWheelIcon();
        }
    }

    signOut() {
        userManager.updateUser({});
        this.allReset();
        authManager.signOut();
    }

    onDisconnected() {
        this.allReset();
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
        const gameId = appManager.ssoGameId;
        GameUtils.clearGameSetting(gameId);
        GameUtils.openGame(gameId, this.miniPanel, onComplete, true);
        appManager.clearSSOGameId();
        sessionManager.removeInRoomGameId();
    }

    reloadCurrentRoomGame() {
        const inRoomGameId = sessionManager.getInRoomGameId();
        if (inRoomGameId) {
            GameUtils.openGame(+inRoomGameId, this.miniPanel, null, true);
        }
    }

    allReset() {
        this.loading.active = false;
        this.compNewsContents.reset();
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

    async showSignName() {
        if (!this.signName) {
            try {
                if (!this.signNamePrefab) {
                    this.signNamePrefab = await GameUtils.loadResource("prefabs/SignName");
                }

                if (this.signNamePrefab) {
                    const node = cc.instantiate(this.signNamePrefab);
                    this.signName = node.getComponent("SignName");
                    this.signName.init(this.handleSignName.bind(this));
                    this.miniPanel.addDialog(node);
                }
            } catch (err) {}
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
