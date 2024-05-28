import { appContainer, lazyInject } from "../../Application";
import { i18n } from "../../ClientModules";
import { OperatorAlias } from "../../ISystem";
import SocketIOController from "../../SocketIOController";
import GameUtils, { BannerType } from "../../common/GameUtils";
import * as sessionManager from "../../common/auth/SessionManager";
import { sentryLogger } from "../../common/logger";
import Notice from "../../common/notice/view-models/Notice";
import NoticeUtil from "../../common/utils/NoticeUtil";
import { getGameConfiguration } from "../../configs/GameConfigurations";
import LobbyMenuConfig from "../../lobby/main/view-models/LobbyMenuConfig";
import { appManager } from "../../managers/AppManager";
import { uiManager } from "../../managers/GameUIManager";
import { InternalEvents } from "../../managers/InternalEvents";
import RandomWaitingMessage from "./RandonWaitingMessage";
import SplashConfig from "./SplashConfig";

const splashConfig = appContainer.get(SplashConfig);

const { ccclass, property } = cc._decorator;

@ccclass
export default class MainSplash extends cc.Component {
    @property(RandomWaitingMessage)
    messageComp: RandomWaitingMessage = null;

    @property(cc.Asset)
    manifestUrl: cc.Asset = null;

    @property(cc.ProgressBar)
    progressBar: cc.ProgressBar = null;

    @property(cc.Node)
    sloganSC1: cc.Node = null;

    @property(cc.Node)
    sloganSC2: cc.Node = null;

    @property(cc.Node)
    sloganSabaPlay: cc.Node = null;

    @property(cc.Node)
    sloganOtherVG: cc.Node = null;

    @property(cc.Node)
    sloganOtherSG: cc.Node = null;

    @property(cc.Node)
    sloganTip88: cc.Node = null;

    @property(cc.Node)
    noticeContainer: cc.Node = null;

    @property(cc.Prefab)
    noticePrefab: cc.Prefab = null;

    @lazyInject(LobbyMenuConfig)
    private readonly lobbyMenuConfig: LobbyMenuConfig;

    @lazyInject(SocketIOController)
    private readonly socketIOController: SocketIOController;

    private loadSceneTimeout: any;

    protected onLoad(): void {
        this.initUIListeners();
        this.requestSSO();
        this.setPositionProgressBarAndMessage();
        this.deactivateAllSlogans();
        this.activateSlogan();
    }

    private setPositionProgressBarAndMessage() {
        const operator = sessionManager.getOperator()?.toUpperCase();
        const spPosition =
            operator === OperatorAlias.TIP88
                ? { progressBar: cc.v2(-335, -230), messageComp: cc.v2(0, -260) }
                : { progressBar: cc.v2(-335, -307), messageComp: cc.v2(0, -331) };
        this.progressBar.node.setPosition(spPosition.progressBar);
        this.messageComp.node.setPosition(spPosition.messageComp);
    }

    private deactivateAllSlogans(): void {
        const slogans = ["sloganSC1", "sloganSC2", "sloganSabaPlay", "sloganOtherVG", "sloganOtherSG", "sloganTip88"];

        for (const slogan of slogans) {
            this.setSloganActiveState(slogan, false);
        }
    }

    private activateSlogan(): void {
        const operator = sessionManager.getOperator()?.toUpperCase();
        if (!operator) {
            this.activateOtherSlogans();
            return;
        }

        const sloganMapping: { [key: string]: string } = {
            [OperatorAlias.SG]: "sloganSC1",
            [OperatorAlias.VG]: "sloganSC2",
            [OperatorAlias.SP]: "sloganSabaPlay",
            [OperatorAlias.TIP88]: "sloganTip88"
        };

        const slogan = sloganMapping[operator];
        if (slogan) {
            this.setSloganActiveState(slogan, true);
        } else {
            this.activateOtherSlogans();
        }
    }

    private activateOtherSlogans(): void {
        this.setSloganActiveState("sloganOtherVG", !splashConfig.enabledSC1);
        this.setSloganActiveState("sloganOtherSG", splashConfig.enabledSC1);
    }

    private setSloganActiveState(slogan: string, isActive: boolean): void {
        this[slogan].active = isActive;
    }

    private initUIListeners() {
        uiManager.emitterListener(InternalEvents.NOTICE, this.showNotice.bind(this), this);
        uiManager.emitterListener(
            InternalEvents.SSO_FAILED,
            () => {
                this.messageComp.reset();
                this.messageComp.setMessage(i18n.t("ui.login_failed"));
            },
            this
        );
        uiManager.emitterListener(
            InternalEvents.SSO_ERROR,
            () => {
                this.messageComp.reset();
                this.messageComp.setMessage(i18n.t("ui.connection_lost"));
            },
            this
        );
        uiManager.emitterListener(
            InternalEvents.GAME_IS_UM,
            (eventMessage: { umMessage; gameId }) => {
                const { umMessage } = eventMessage;
                const text = NoticeUtil.getMessageByLocale(umMessage);
                if (text) {
                    const data = {
                        text: text,
                        isInfo: false
                    };
                    uiManager.emitter.emit(InternalEvents.NOTICE, {
                        data,
                        onConfirm: null,
                        onClose: () => appManager.backToOperatorLobby()
                    });
                }
            },
            this
        );
        uiManager.emitterListener(
            InternalEvents.NOT_PERMITTED_TO_PLAY,
            (eventMessage) => {
                const { gameId } = eventMessage;
                const gameName = GameUtils.getGameNameString(gameId);
                const message = i18n.t("messages.gameExcluded", { gameName: gameName });
                const data = {
                    text: message,
                    isInfo: true
                };

                uiManager.emitter.emit(InternalEvents.NOTICE, {
                    data,
                    onConfirm: null,
                    onClose: () => appManager.backToOperatorLobby()
                });
            },
            this
        );
    }

    private clearUIListeners() {
        uiManager.removeListenersWithTarget(this);
    }

    async requestSSO() {
        try {
            this.updateProgress(0);
            if (!appManager.authorized) {
                await appManager.ssoAndAuthorize();
            }

            if (appManager.isDirectMode) {
                await this.loadGameDirectly();
            } else {
                this.preloadLobbyScene();
            }
        } catch (error) {
            sentryLogger.logError(error);
        }
    }

    async loadGameDirectly() {
        const gameId = sessionManager.getInRoomGameId() || appManager.directGameId;
        const updateProgress = ({ progress, total }) => {
            this.onProgress(progress, total);
        };
        uiManager.emitterListener(`${InternalEvents.LOADING_GAME}-${gameId}`, updateProgress, this);
        try {
            await GameUtils.openGameDirect(gameId, this.socketIOController);
            uiManager.removeListenersWithName(`${InternalEvents.LOADING_GAME}-${gameId}`);
        } catch (error) {
            console.warn(`Can not load game directly id ${gameId}`, error);
        }
    }

    preloadLobbyScene() {
        this.loadSceneTimeout = setTimeout(
            function () {
                cc.director.preloadScene("Lobby", this.onProgress.bind(this), this.onLoaded.bind(this));
            }.bind(this),
            100
        );
    }

    onProgress(completedCount, totalCount) {
        const percent = completedCount / totalCount;
        this.updateProgress(percent);
    }

    async onLoaded() {
        await this.preLoadBanner();
        await this.preLoadGameIcons();

        cc.resources.loadDir("lobby/games/skeleton-icon", () => {
            cc.director.loadScene("Lobby");
        });
    }

    private async preLoadGameIcons() {
        try {
            const preLoadGameCount = 10;

            const preLoadGameIds =
                this.lobbyMenuConfig.firstCategoryList?.length >= preLoadGameCount
                    ? this.lobbyMenuConfig.firstCategoryList.slice(0, preLoadGameCount)
                    : this.lobbyMenuConfig.firstCategoryList;
            const preLoadGameAwaiters = preLoadGameIds.map((gameId) => GameUtils.loadGameIcon(gameId));

            const preLoadGameBySystemAwaiters = preLoadGameIds
                .filter((gameId) => this.lobbyMenuConfig.customGameIconBySystem.includes(gameId))
                .map((gameId) => GameUtils.loadGameIcon(gameId, splashConfig.customPath));

            const preloadRemoteGameIds = preLoadGameIds.filter((id) => getGameConfiguration(id).isMicrosite);
            for (const gameId of preloadRemoteGameIds) {
                await GameUtils.preloadRemoteIcon(gameId);
            }

            await Promise.all(preLoadGameAwaiters.concat(preLoadGameBySystemAwaiters));
        } catch (ex) {
            console.log(ex);
        }
    }

    private async preLoadBanner() {
        try {
            if (this.lobbyMenuConfig.bannerAds.length < 1) {
                return;
            }
            const bannerId = this.lobbyMenuConfig.bannerAds[0];

            let bannerAwaiters: Promise<unknown>;
            const bannerType = GameUtils.getBannerTypeByGameId(bannerId);
            if (bannerType === BannerType.Prefab) {
                bannerAwaiters = GameUtils.getAnimationBanner(bannerId);
            } else {
                bannerAwaiters = GameUtils.getStaticBanner(bannerId);
            }

            const bannerContainerAwaiters = new Promise((resolve) => {
                cc.resources.load("lobby/banner/bannerContainer", resolve);
            });

            await Promise.all([bannerAwaiters, bannerContainerAwaiters]);
        } catch (ex) {
            console.log(ex);
        }
    }

    updateProgress(progress) {
        if (this) {
            this.updateProgressBar(progress);
        }
    }

    updateProgressBar(progress) {
        if (this.progressBar) {
            this.progressBar.progress = progress;
        }
    }

    protected onDestroy(): void {
        clearTimeout(this.loadSceneTimeout);
        this.clearUIListeners();
    }

    showNotice(eventMessage: { data; onConfirm; onClose }) {
        const { data, onConfirm, onClose } = eventMessage;
        const node = cc.instantiate(this.noticePrefab);
        const notice = node.getComponent(Notice);

        data.button = { text: "OK" };
        notice.init(data);

        if (onConfirm) {
            notice.handleClickButton = onConfirm;
        }

        if (onClose) {
            notice.handleClose = onClose;
        }

        this.noticeContainer.addChild(node);
    }
}
