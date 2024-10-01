import { Socket } from "socket.io-client";
import { getSession } from "../../common/auth/SessionManager";
import GameUtils from "../../common/GameUtils";
import LazyloadSprite from "../../common/LazyloadSprite";
import { getGameName } from "../../configs/GameConfigurations";
import { uiManager } from "../../managers/GameUIManager";
import { InternalEvents } from "../../managers/InternalEvents";
import { DisableGameHandler } from "./handlers/disable-game-handler";
import { GameInfoHandler } from "./handlers/game-info-handler";
import { RoundHistoryHandler } from "./handlers/round-history-handler";
import { DisableGameStore } from "./models/disable-game-store";
import { Durations } from "./models/durations-interface";
import { GameInfoStore } from "./models/game-info-store";
import { GameData } from "./models/gateway-game-data";
import { RoundHistoryStore } from "./models/round-history-store";
import RenderItem from "./render-item/render-item";
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

    init(settings: { gameId: number; serviceName: string; socket: Socket; durations: Durations }) {
        const { gameId, serviceName, socket, durations } = settings;
        this.gameId = gameId;
        this.serviceName = serviceName;
        this.socket = socket;
        this.updateGameName(this.gameId);
        this.initGameData(durations);
        this.initListener();
        this.loadLazyloadSprites();
    }

    loadLazyloadSprites() {
        const lazyloadSprites = this.getComponentsInChildren(LazyloadSprite);
        lazyloadSprites.forEach((sprite) => {
            sprite.suffix = `-${this.gameId}`;
            sprite.loadSprite();
        });
    }

    onDestroy() {
        this.socket.offAny(this.filterDataGame);
        this.gameData = null;
        this.socket = null;
    }

    async updateGameName(gameId: number) {
        this.labelGameName.string = await GameUtils.getDisplayGameName(gameId);
        if (this.labelGameName.string === "") {
            this.labelGameName.string = `Game___${gameId}`;
        }
    }

    sendSignIn(receivedEvents: string[]) {
        const data = {
            gameName: this.gameName,
            receivedEvents: receivedEvents,
            session: getSession()
        };
        if (this.serviceName !== "") {
            data["serviceName"] = this.serviceName;
        }
        this.socket.emit("signIn", data);
    }

    initGameData(durations: Durations) {
        this.gameData = new GameData();
        this.gameData.initHandlers([RoundHistoryHandler, GameInfoHandler, DisableGameHandler]);

        const infoStore = new GameInfoStore();
        infoStore.durations = durations;
        this.gameData.addStores([new RoundHistoryStore(), infoStore, new DisableGameStore()]);
        this.initRenderItems();
    }

    initListener() {
        this.socket.onAny(this.filterDataGame);
    }

    filterDataGame = (event: string, data: any) => {
        const eventLowerCase = event.toLocaleLowerCase();
        const gameName = this.gameName.toLocaleLowerCase();
        if (eventLowerCase === gameName || (eventLowerCase === "message" && data.gameName?.toLocaleLowerCase() === gameName)) {
            this.onData(data);
        }
    };

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

    onClickOpenGame() {
        uiManager.emitter.emit(InternalEvents.GATEWAY_OPEN_GAME);
        GameUtils.openGame(this.gameId, null, null, false);
    }
}
