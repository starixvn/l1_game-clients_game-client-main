import axios from "axios";

import * as SessionManager from "../../common/auth/SessionManager";
import GameUtils from "../../common/GameUtils";
import { buildProxyUrl } from "../../common/helpers/UrlHelper";
import { sentryLogger } from "../../common/logger";
import { initialize as initGameConfiguration } from "../../configs/GameConfigurations";
import { uiManager } from "../../managers/GameUIManager";
import { InternalEvents } from "../../managers/InternalEvents";
import { AXIOS_FAILED_PREFIX } from "../../utils";

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

    protected onLoad(): void {
        this.disableAllNodeSplash();
        this.initUIListeners();
        this.handleSplashScene();
        this.loadBackground();
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
        await initGameConfiguration();
        if (await this.isOpenMicrositeGame()) {
            this.enableMicrositeGameIframe();
        } else {
            this.enableMainSplashScreen();
        }
    }

    private enableMicrositeGameIframe() {
        const urlParams = new URLSearchParams(window.location.search);
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

    private async isOpenMicrositeGame() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has("token") && urlParams.has("gameId") && urlParams.get("gameId") !== "0") {
            const gameId = +urlParams.get("gameId");
            if (await this.isMicrositeGame(gameId)) {
                return GameUtils.healthCheckMicrositeGame(gameId);
            }
            return false;
        }
        return !urlParams.has("token") && +SessionManager.getMicrositeGameId() > 0;
    }

    async isMicrositeGame(gameId) {
        const url = buildProxyUrl(`/game/configurations/${gameId}`);
        const configuration = await axios
            .get(url)
            .then((response) => response.data)
            .catch(() => {
                sentryLogger.log(`${AXIOS_FAILED_PREFIX} get ${url}`);
                return {};
            });
        return configuration.isMicrosite;
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
