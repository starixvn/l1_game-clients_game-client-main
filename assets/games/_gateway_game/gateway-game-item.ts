import { Socket } from "socket.io-client";
import { getSession } from "../../common/auth/SessionManager";
import GameUtils from "../../common/GameUtils";
import { getGameName } from "../../configs/GameConfigurations";
import RenderItem from "../render-item/render-item";
import { GameInfoHandler } from "./handlers/game-info-handler";
import { RoundHistoryHandler } from "./handlers/round-history-handler";
import { GameData } from "./models/game-data";
import { GameInfoStore } from "./models/game-info-store";
import { RoundHistoryStore } from "./models/round-history-store";
const { ccclass, property } = cc._decorator;
@ccclass
export default class GatewayGameItem extends cc.Component {
    @property(cc.Label)
    labelGameName: cc.Label = null;

    renderItems: RenderItem[] = [];
    gameId = 0;
    serviceName = "";
    socket: Socket;
    gameData: GameData = null;

    public get gameName() {
        return getGameName(this.gameId);
    }

    initRenderItems() {
        this.renderItems = this.getComponentsInChildren(RenderItem);
        this.renderItems.forEach((item) => item.init(this.gameData));
    }

    init(gameId: number, serviceName: string, socket: Socket) {
        this.gameId = gameId;
        this.serviceName = serviceName;
        this.socket = socket;
        this.updateGameName(this.gameId);
        this.initGameData();
        this.initListener();
    }

    async updateGameName(gameId: number) {
        this.labelGameName.string = await GameUtils.getDisplayGameName(gameId);
    }

    sendSignIn(receivedEvents: string[]) {
        this.socket.emit("signIn", {
            serviceName: this.serviceName,
            gameName: this.gameName.toLocaleLowerCase(),
            receivedEvents: receivedEvents,
            session: getSession()
        });
    }

    initGameData() {
        this.gameData = new GameData();
        this.gameData.initHandlers([RoundHistoryHandler, GameInfoHandler]);
        this.gameData.addStores([new RoundHistoryStore(), new GameInfoStore()]);
        this.initRenderItems();
    }

    initListener() {
        this.socket.onAny(this.filterDataGame.bind(this));
    }

    filterDataGame(event: string, data: any) {
        const eventLowerCase = event.toLocaleLowerCase();
        if (eventLowerCase === this.gameName.toLocaleLowerCase() || eventLowerCase === "message") {
            this.onData(data);
        }
    }

    getLobbyInfo() {
        this.socket.emit("getLobbyData", { gameName: this.gameName });
    }

    onData(data: any) {
        if (data.signedIn) {
            this.onSignedIn();
            return;
        }
        this.gameData.receiveData(data);
    }

    onSignedIn() {
        this.getLobbyInfo();
    }

    onClickOpenGame() {}
}
