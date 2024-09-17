import { lazyInject } from "../../Application";
import * as SessionManager from "../../common/auth/SessionManager";
import GameUtils from "../../common/GameUtils";
import { userManager } from "../../common/user/UserManager";
import NoticeUtil from "../../common/utils/NoticeUtil";
import { getGameConfiguration, initialize as initGameConfiguration, isGatewayGame } from "../../configs/GameConfigurations";
import { appManager } from "../../managers/AppManager";
import { uiManager } from "../../managers/GameUIManager";
import { InternalEvents } from "../../managers/InternalEvents";
import SocketIOController from "../../SocketIOController";

const { ccclass, property } = cc._decorator;
@ccclass
export default class Splash extends cc.Component {
    @property(cc.Node)
    background: cc.Node = null;

    @property(cc.Node)
    nodeMainSplash: cc.Node = null;

    @property(cc.Node)
    nodeMicrositeGame: cc.Node = null;

    @property(cc.Prefab)
    prfMicrositeGame: cc.Prefab = null;

    @property(cc.Node)
    nodeDialog: cc.Node = null;

    @lazyInject(SocketIOController)
    private readonly socketIOControler: SocketIOController;

    protected onLoad(): void {
        this.disableAllNodeSplash();
        this.initUIListeners();
        this.loadBackground();

        this.handleAuthorization();
    }

    private initUIListeners() {
        uiManager.emitterListener(InternalEvents.MICROSITE_BACK_TO_LOBBY, this.enableMainSplashScreen.bind(this), this);
        uiManager.emitterListener(InternalEvents.MICROSITE_OPEN_GAME_BACK_FROM_LOBBY, this.openGameFromMicroGame.bind(this), this);
    }

    private clearUIListeners() {
        uiManager.removeListenersWithTarget(this);
    }

    protected onDestroy(): void {
        this.clearUIListeners();
    }

    private async handleSplashScene() {
        const urlParams = appManager.urlParams;
        const hasToken = urlParams.has("token");
        const hasGameId = urlParams.has("gameId");
        const gameId = +urlParams.get("gameId");

        const ssoToGame = hasToken && hasGameId && gameId !== 0;
        if (ssoToGame) {
            if (isGatewayGame(gameId) && !appManager.isDirectMode) {
                cc.log("Open gateway at Splash");
                const gameConfiguration = getGameConfiguration(gameId);
                const mainId = gameConfiguration.gateway?.id;
                GameUtils.openSocketGatewayGame(mainId, this.socketIOControler);
                appManager.clearSSOGameId();
                return;
            } else if (this.isMicrositeGame(gameId)) {
                cc.log("Open game microsite at Splash ", gameId);
                await this.enableMicrositeGameIframe(gameId);
                appManager.clearSSOGameId();
                return;
            }
        }

        const micrositeGameId = +SessionManager.getMicrositeGameId();
        const isReloadFromMicrositeGame = !hasToken && micrositeGameId > 0;
        if (isReloadFromMicrositeGame) {
            await this.enableMicrositeGameIframe(micrositeGameId);
            return;
        }

        cc.log("Active Main Splash");
        this.enableMainSplashScreen();
    }

    private async handleAuthorization() {
        await initGameConfiguration();
        if (!appManager.authorized) {
            await appManager.ssoAndAuthorize();
            if (!appManager.authorized) {
                if (!appManager.autoGenerateNickname) {
                    this.showSignName();
                }
                return;
            }
        }

        this.handleSplashScene();
    }

    async showSignName() {
        const prefab = await GameUtils.loadResource("prefabs/SignName");

        const node = cc.instantiate(prefab);
        const signName = node.getComponent("SignName");
        signName.init(this.handleSignName.bind(this));

        this.nodeDialog.addChild(node);
    }

    handleSignName(response) {
        if (response.authorized) {
            appManager.authorized = true;
            userManager.updateUser(response.user);
            this.serviceAuthorized(response.authorized);
        } else {
            const errorCode = response.errorCode;
            const text = NoticeUtil.getLocalizedErrorMessage(errorCode, { errorCode });
            this.showNotice(text);
        }
    }

    async showNotice(text: string) {
        const data = {
            text: text,
            isInfo: false
        };
        uiManager.emitter.emit(InternalEvents.NOTICE, { data });
    }

    serviceAuthorized(Authorized) {
        if (!Authorized) {
            this.showSignName();
        } else {
            this.handleSplashScene();
        }
    }

    private async enableMicrositeGameIframe(gameId) {
        const healthy = await GameUtils.healthCheckMicrositeGame(gameId);
        if (!healthy) {
            this.enableMainSplashScreen();
            return;
        }

        const urlParams = appManager.urlParams;
        if (urlParams.has("op")) {
            const operator = urlParams.get("op");
            SessionManager.storeOperator(operator);
        }

        if (urlParams.has("gameId")) {
            const gameId = +urlParams.get("gameId");
            SessionManager.clearStorageMicroSite(true);
            SessionManager.storeMicrositeGameId(gameId);
        }
        const iframe = cc.instantiate(this.prfMicrositeGame);
        this.nodeMicrositeGame.addChild(iframe);
        this.nodeMicrositeGame.active = true;
        this.nodeMainSplash.active = false;
        setTimeout(() => {
            this.background.active = false;
        }, 100);
    }

    private enableMainSplashScreen() {
        GameUtils.setCanvasVisibilty(true);
        this.background.active = true;
        this.nodeMainSplash.active = true;
        this.nodeMicrositeGame.destroyAllChildren();
        this.nodeMicrositeGame.active = false;
    }

    isMicrositeGame(gameId) {
        const gameConfiguration = getGameConfiguration(gameId);
        return GameUtils.isMicroSite(gameConfiguration);
    }

    private openGameFromMicroGame(gameId: number) {
        SessionManager.storeInRoomGameId(gameId);
        this.enableMainSplashScreen();
    }

    private disableAllNodeSplash() {
        this.nodeMainSplash.active = false;
        this.nodeMicrositeGame.active = false;
    }

    private loadBackground() {
        const imagePath = `${window.location.origin}/splash-resources/background.jpg`;
        cc.assetManager.loadRemote(imagePath, (err, imageAsset: "jpg") => {
            try {
                const spriteFrameTmp = new cc.SpriteFrame(imageAsset);
                this.background.getComponent(cc.Sprite).spriteFrame = spriteFrameTmp;
            } catch (e) {}
        });
    }
}
