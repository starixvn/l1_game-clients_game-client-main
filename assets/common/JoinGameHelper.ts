import { getGameConfiguration } from "../configs/GameConfigurations";
import { appManager } from "../managers/AppManager";
import SocketIOController from "../SocketIOController";
import GameUtils from "./GameUtils";

export default class JoinGameHelper {
    public async joinGameIsNotMiniGame(gameId: number, socketIOControler: SocketIOController) {
        const gameConfiguration = getGameConfiguration(gameId);
        if (!!gameConfiguration?.isMicrosite) {
            await GameUtils.openGameMicrosite(gameId);
            return;
        }
        await GameUtils.tryOpenGameDirect(gameId, socketIOControler);
        if (appManager.currentScene?.onCloseGame) {
            appManager.currentScene.openOtherScene = true;
            appManager.currentScene.onCloseGame();
        }
        await GameUtils.loadSceneGame(gameId, socketIOControler);
    }

    public getGameId(gameId: number) {
        const miniSedieIds = [9, 56, 57, 58];
        return miniSedieIds.includes(gameId) ? miniSedieIds[0] : gameId;
    }
}
