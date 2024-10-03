import axios from "axios";

import * as SessionManager from "../../common/auth/SessionManager";
import GameUtils from "../../common/GameUtils";
import { buildProxyUrl } from "../../common/helpers/UrlHelper";
import { sentryLogger } from "../../common/logger";
import { uiManager } from "../../managers/GameUIManager";
import { InternalEvents } from "../../managers/InternalEvents";
import { AXIOS_FAILED_PREFIX } from "../../utils";
import PromotionTournamentHandler, { PromotionTournamentEvents, promotionTournamentHandler } from "../../lobby/promotions/PromotionTournamentHandler";

const { ccclass, property } = cc._decorator;
@ccclass
export default class Splash extends cc.Component {
    @property(cc.Node)
    background: cc.Node = null;

    @property(cc.Node)
    nodeMainSplash: cc.Node = null;

    @property(cc.Node)
    nodeTournamentPromotion: cc.Node = null;

    @property(cc.Node)
    nodeMicrositeGame: cc.Node = null;

    @property(cc.Prefab)
    prfMicrositeGame: cc.Prefab = null;

    @property(cc.Node)
    dialog: cc.Node = null;

    private promotionTournamentPrefab: cc.Prefab = null;

    protected onLoad(): void {
        promotionTournamentHandler.on(PromotionTournamentEvents.OPEN_PROMOTION_TOURNAMENT, this.showPromotionTournament.bind(this));
        this.initUIListeners();
        this.disableAllNodeSplash();
        this.handleSplashScene();
        this.loadBackground();
        // this.requestSSO();

        // PromotionTournamentHandler.getInstance().checkTournamentPromotionsBeforeSignIn();
    }
    async showPromotionTournament() {
        if (!this.promotionTournamentPrefab) {
            await this.createPromotionTournamentPrefab();
        }
        const node = cc.instantiate(this.promotionTournamentPrefab);
        this.addDialog(node);
    }

    async createPromotionTournamentPrefab() {
        const key = "promotionTournament";
        if (!uiManager.prefabCache.miniPanelIcons[key]) {
            this.promotionTournamentPrefab = await GameUtils.asyncExecute<cc.Prefab>(
                this.node,
                GameUtils.loadResource("promotion-tournament/views/PromotionTournamentWebView")
            );
            uiManager.prefabCache.miniPanelIcons[key] = this.promotionTournamentPrefab;
        } else {
            this.promotionTournamentPrefab = uiManager.prefabCache.miniPanelIcons[key];
        }
    }

    addDialog(dialogNode: cc.Node) {
        // this.enableMainSplashScreen();
        this.nodeTournamentPromotion.getChildByName('dialog')?.addChild(dialogNode);
    }

    async requestSSO() {
        try {
            // await appManager.ssoAndAuthorize();
            // PromotionTournamentHandler.getInstance().checkTournamentPromotionsBeforeSignIn();
        } catch (error) {
            sentryLogger.logError(error);
        }
    }

    private initUIListeners() {
        uiManager.emitterListener(InternalEvents.MICROSITE_BACK_TO_LOBBY, this.enableMainSplashScreen.bind(this), this);
        uiManager.emitterListener(InternalEvents.MICROSITE_OPEN_GAME_BACK_FROM_LOBBY, this.openGameFromMicroGame.bind(this), this);
        uiManager.emitterListener(InternalEvents.HANDLE_ON_SIGN_IN, this.handleSplashScene.bind(this), this);
    }

    private clearUIListeners() {
        uiManager.removeListenersWithTarget(this);
    }

    protected onDestroy(): void {
        this.clearUIListeners();
    }

    private async handleSplashScene() {

        if (await this.isOpenMicrositeGame()) {
            // PromotionTournamentHandler.getInstance().checkTournamentPromotionsBeforeSignIn();
            // this.enableMicrositeGameIframe();
            this.handleSplashScene()
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
            } catch (e) { }
        });
    }
}
