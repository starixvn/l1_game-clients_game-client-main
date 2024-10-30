import * as i18n from "i18n/runtime-scripts/LanguageData";

import { lazyInject } from "../Application";
import { initialize as initGameConfiguration } from "../configs/GameConfigurations";
import { appManager } from "../managers/AppManager";
import { StorageManager } from "../managers/StorageManager";
import SocketIOController from "../SocketIOController";
import AudioManager from "./audio/AudioManager";
import MusicPlayer from "./audio/MusicPlayer";
import * as AuthManager from "./auth/AuthManager";
import * as SessionManager from "./auth/SessionManager";
import CustomWebView from "./CustomWebView";
import GameUtils from "./GameUtils";
import { buildMicrositeGameUrl } from "./helpers/UrlHelper";
import JoinGameHelper from "./JoinGameHelper";
import PromotionTournamentHandler from "../lobby/promotions/PromotionTournamentHandler";
import * as authManager from "../common/auth/AuthManager";

const { ccclass, property } = cc._decorator;

declare global {
    interface Window {
        microsite: any;
        isUserGesture: boolean;
    }
}

export type MicrositeGameParams = {
    backLobby?: boolean;
    ss?: string;
    time?: number;
    username?: string;
    isAuthenticated?: boolean;
    memberName?: string;
    language?: string;
    musicEnable?: boolean;
    sfxEnable?: boolean;
    sessionTimeout?: boolean;
    copyToClipboard?: string;
    hasSSO?: boolean;
    getGameName?: number;
    replaceUrl?: string;
    gameId?: number;
    promotion?: string;
    clearQueryStringOnUrl?: boolean;
    splashEnabled?: boolean;
    isUserGesture?: boolean;
    operator?: string;
};


@ccclass
export default class BaseMicrositeGame extends cc.Component {
    @property(CustomWebView)
    webview: CustomWebView = null;

    @property(cc.Node)
    tournamentPromotionPopup: cc.Node = null;

    private readonly MusicStorageKey = "SOUND_BACKGROUND";
    private readonly SFXStorageKey = "SOUND_GAME";
    private micrositeUrl = "";
    private isLoadingLobby = false;

    @lazyInject(SocketIOController)
    private readonly socketIOControler: SocketIOController;

    protected onLoad(): void {
        SessionManager.removeCheckedTournamentPromotionFirstSso();
        this.stopMainAction();
        this.loadMicrositeGame();
        window.addEventListener("message", this.handleEvent);
    }

    setCanvasVisibilty(active: boolean) {
        GameUtils.setCanvasVisibilty(active);
    }

    protected onDestroy(): void {
        window.microsite = {};
        window.removeEventListener("message", this.handleEvent);
    }

    protected stopMainAction() {
        const audio = AudioManager.getInstance();
        audio.stopMusic();
        audio.stopAllSFX();
        const musicPlayer = MusicPlayer.getInstance();
        musicPlayer.stopBackgroundAudio();
    }

    protected loadMicrositeGame() {
        const urlParams = new URLSearchParams(window.location.search);
        authManager.checkHasTokenWhenOpenMicroGame(urlParams);
        this.micrositeUrl = buildMicrositeGameUrl(SessionManager.getMicrositeGameId());
        const queryString = this.getMicrositeGameQueryString();
        this.webview && (this.webview.url = `${this.micrositeUrl}/${queryString}`);
    }

    handleEvent = async ({ data }: { data: MicrositeGameParams }) => {
        if (data.replaceUrl) {
            console.log(` handleEvent data.replaceUrl : ${data.replaceUrl}`)
            window.location.replace(data.replaceUrl);
        }
        if (data.splashEnabled) {
            this.setCanvasVisibilty(false);
            this.handleUserGesturePage();
            this.handleClearStorage();
            const className = "microsite-iframe";
            !this.webview?._impl?._iframe?.classList?.contains(className) && this.webview?._impl?._iframe?.classList?.add(className);
            console.log(` handleEvent data.splashEnabled : ${data.splashEnabled}`)
            return;
        }
        if (data.hasSSO) {
            console.log(` handleEvent data.hasSSO : ${data.hasSSO}`)
            setTimeout(() => {
                PromotionTournamentHandler.getInstance().checkTournamentPromotionsBeforeSignIn(true);
            }, 1000);

            window.microsite = { hasSSO: true };
            return;
        }
        if (data.sessionTimeout) {
            console.log(` handleEvent data.sessionTimeout : ${data.sessionTimeout}`)
            this.handleSignOut();
            return;
        }

        if (data.backLobby && !this.isLoadingLobby) {
            console.log(` handleEvent data.backLobby : ${data.backLobby}`)
            this.isLoadingLobby = true;

            await this.handleBackToLobby(data);
            return;
        }
        if (data.getGameName) {
            console.log(` handleEvent data.getGameName : ${data.getGameName}`)
            this.getGameName(data.getGameName, data.language);
            return;
        }
        if (data.copyToClipboard) {
            console.log(` handleEvent data.copyToClipboard : ${data.copyToClipboard}`)
            this.handleCopyToClipboard(data.copyToClipboard);
            return;
        }
        if (data.clearQueryStringOnUrl) {
            console.log(` handleEvent data.clearQueryStringOnUrl : ${data.clearQueryStringOnUrl}`)
            AuthManager.clearQueryStringOnUrl();
        }
        if (data.isUserGesture) {
            console.log(` handleEvent data.isUserGesture : ${data.isUserGesture}`);

            this.tournamentPromotionPopup.removeAllChildren();
            AudioManager.getInstance().isUserGesture = true;
            window.isUserGesture = true;
        }

        this.handleOperator();

        this.handleChangeAudio(data);
    };

    protected getMicrositeGameQueryString() {
        return "";
    }

    protected async handleBackToLobby(data: MicrositeGameParams) {
        SessionManager.removeMicrositeGameId();
        await this.updateSession(data);
        AudioManager.getInstance().initDefaultStorage();

        if (data.gameId > 0) {
            this.onClickJoinGame(data.gameId);
            return;
        }
        this.loadLobbyScene();
    }

    protected async updateSession(session: MicrositeGameParams) {
        //
    }

    protected loadLobbyScene() {
        //
    }

    private handleChangeAudio(data: MicrositeGameParams) {
        data.musicEnable !== undefined && StorageManager.set(this.MusicStorageKey, data.musicEnable);
        data.sfxEnable !== undefined && StorageManager.set(this.SFXStorageKey, data.sfxEnable);
    }

    private handleOperator() {
        const operator = SessionManager.getOperator();
        if (operator) {
            this.postMessageToMicrosite({ op: operator });
        }
    }

    private handleSignOut() {
        SessionManager.removeMicrositeGameId();
        SessionManager.removeSession();
    }

    private postMessageToMicrosite(data: any) {
        this.webview?._impl._iframe.contentWindow.postMessage(data, this.micrositeUrl);
    }

    private async handleCopyToClipboard(text: string) {
        const copySuccessfully = await GameUtils.copyText(text);
        this.postMessageToMicrosite({ copySuccessfully });
    }

    private async getGameName(gameId: number, language = "en") {
        window.gameConfigurations === undefined && (await initGameConfiguration());
        i18n.init(language);
        const gameName = await GameUtils.getDisplayGameName(gameId);
        this.postMessageToMicrosite({ gameName, gameId });
    }

    protected async onClickJoinGame(gameId: number) {
        const joinGameHelper = new JoinGameHelper();
        if (!GameUtils.isMiniGame(gameId.toString())) {
            await joinGameHelper.joinGameIsNotMiniGame(gameId, this.socketIOControler);
        } else {
            cc.director.loadScene("Lobby", () => {
                this.setCanvasVisibilty(true);
                GameUtils.openGame(joinGameHelper.getGameId(gameId), appManager.miniPanel);
            });
        }
    }

    private async handleClearStorage() {
        const isClearStorage = SessionManager.getClearStorageMicroSite();
        if (isClearStorage) {
            SessionManager.clearStorageMicroSite(false);
            this.postMessageToMicrosite({ isClearStorage });
        }
    }

    private async handleUserGesturePage() {
        const isUserGesture = AudioManager.getInstance().isUserGesture;
        this.postMessageToMicrosite({ isUserGesture });
    }
}
