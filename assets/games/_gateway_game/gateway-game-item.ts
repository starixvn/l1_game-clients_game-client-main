import { Socket } from "socket.io-client";
import { getSession } from "../../common/auth/SessionManager";
import { getGameName } from "../../configs/GameConfigurations";
import { GameInfoHandler } from "./handlers/game-info-handler";
import { RoundHistoryHandler } from "./handlers/round-history-handler";
import { GameData } from "./models/game-data";
import { GameInfoStore } from "./models/game-info-store";
import { RoundHistoryStore } from "./models/round-history-store";
const { ccclass, property } = cc._decorator;
@ccclass
export default class GatewayGameItem extends cc.Component {
    gameId = 0;
    socket: Socket;
    gameData: GameData = null;

    public get gameName() {
        return getGameName(this.gameId);
    }

    init(gameId: number, socket: Socket) {
        this.gameId = gameId;
        this.socket = socket;
        this.initGameData();
        this.initListener();
    }

    sendSignIn(receivedEvents: string[]) {
        this.socket.emit("signIn", {
            serviceName: "baccaratx",
            gameName: this.gameName,
            receivedEvents,
            session: getSession()
        });
    }

    initGameData() {
        this.gameData = new GameData();
        this.gameData.initHandlers([RoundHistoryHandler, GameInfoHandler]);
        this.gameData.addStores([new RoundHistoryStore(), new GameInfoStore()]);
    }

    initListener() {
        this.socket.off(this.gameName).on(this.gameName, this.onData.bind(this));
    }
    getLobbyInfo() {
        this.socket.emit("lobbyInfo");
    }

    onData(data: any) {
        this.gameData.receiveData(data);
    }
}
