import BaseMicrositeGame from "../../common/BaseMicrositeGame";
import GameUtils from "../../common/GameUtils";
import * as AuthManager from "../../common/auth/AuthManager";
import * as SessionManager from "../../common/auth/SessionManager";
import { appManager } from "../../managers/AppManager";

const { ccclass } = cc._decorator;

@ccclass
export default class MicrositeGame extends BaseMicrositeGame {
    protected getMicrositeGameQueryString() {
        return GameUtils.getSiteQueryString();
    }

    protected async updateSession(data) {
        const session = AuthManager.updateSession(SessionManager.getSession(), data);
        AuthManager.setAuthorizeInfo(session);
        AuthManager.setRecheckInInterval();
        appManager.authorized = await appManager.authorizeByUserService();
    }

    protected loadLobbyScene() {
        cc.director.loadScene("Lobby", async () => {
            await this.handleBackFromMicrositeGame();
        });
    }

    onDestroy(): void {
        this.setCanvasVisibilty(true);
        super.onDestroy();
    }
}
