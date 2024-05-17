import BaseMicrositeGame from "../../common/BaseMicrositeGame";
import GameUtils from "../../common/GameUtils";
import AudioManager from "../../common/audio/AudioManager";
import * as AuthManager from "../../common/auth/AuthManager";
import NotificationService from "../../common/auth/NotificationService";
import * as SessionManager from "../../common/auth/SessionManager";
import { userManager } from "../../common/user/UserManager";
import { appManager } from "../../managers/AppManager";
import { jackpotManager } from "../../managers/JackpotManager";

const { ccclass } = cc._decorator;

@ccclass
export default class MicrositeGame extends BaseMicrositeGame {
    protected stopMainAction() {
        super.stopMainAction();
        NotificationService.getInstance().forceKickedOut();
        AuthManager.removeRecheckInInterval();
    }

    protected getMicrositeGameQueryString() {
        const auData = SessionManager.getSession();
        if (!auData.ss) {
            return "";
        }
        const directMode = SessionManager.getDirectMode();
        const operator = SessionManager.getOperator();
        const audio = AudioManager.getInstance();
        const params = {
            ss: auData.ss,
            uname: auData.username,
            lang: auData.language,
            appType: auData.system,
            ref: directMode?.ref,
            rurl: appManager.checkDirectModeRefData(directMode?.ref) ? directMode?.returnUrl : GameUtils.base64Encode(window.location.href),
            purl: GameUtils.base64Encode(window.location.href),
            musicEnable: audio.musicEnabled,
            sfxEnable: audio.sfxEnabled,
            isUserGesture: audio.isUserGesture,
            op: operator
        };

        const searchParams = new URLSearchParams();
        Object.keys(params).forEach((key) => params[key] !== undefined && searchParams.append(key, params[key]));
        const encodedQueryString = GameUtils.base64Encode(searchParams.toString());
        return `?params=${encodedQueryString}`;
    }

    protected async updateSession(data) {
        const session = AuthManager.updateSession(SessionManager.getSession(), data);
        AuthManager.setAuthorizeInfo(session);
        AuthManager.setRecheckInInterval();
        appManager.authorized = await appManager.authorizeByUserService();
    }

    protected loadLobbyScene() {
        cc.director.loadScene("Lobby", async () => {
            this.setCanvasVisibilty(true);
            await appManager.microSiteLaunchedInit();
            !userManager.disableJackpotGames && jackpotManager.requestAllJackpotPools();
        });
    }
}
