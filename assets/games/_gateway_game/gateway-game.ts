import { Socket } from "socket.io-client";
import { lazyInject } from "../../Application";
import BaseComponent from "../../common/BaseComponent";
import { getGameName } from "../../configs/GameConfigurations";
import SocketIOController from "../../SocketIOController";
import GatewayGameItem from "./gateway-game-item";
const { ccclass, property } = cc._decorator;

@ccclass
export default class GatewayGame extends BaseComponent {
    @property(cc.JsonAsset)
    configs: cc.JsonAsset = null;

    @property(cc.Prefab)
    gamePrefab: cc.Prefab = null;

    @property(cc.Node)
    container: cc.Node = null;

    @lazyInject(SocketIOController)
    public readonly socketIOController: SocketIOController;
    socket: Socket;
    public gameId = 0;
    gameIds: number[] = [];
    receivedEvents: string[] = [];

    public get gameName() {
        return getGameName(this.gameId);
    }

    onLoad() {
        this.loadConfigs();
        this.initSocket();
        this.initItems();
        cc.game.on(cc.game.EVENT_HIDE, this.onGameHide, this);
        cc.game.on(cc.game.EVENT_SHOW, this.onGameShow, this);
    }

    loadConfigs() {
        const configs = this.configs.json;
        this.gameId = configs.gameId;
        this.gameIds = configs.gameIds;
        this.receivedEvents = configs.receivedEvents;
    }

    initSocket() {
        this.socket = this.socketIOController.getSocketGame(this.gameId);
        if (this.socket) {
            this.initSocketListeners();
        }
    }

    initItems() {
        this.gameIds.forEach((gameId) => {
            const node = cc.instantiate(this.gamePrefab);
            this.container.addChild(node);

            const item = node.getComponent(GatewayGameItem);
            item.init(gameId, this.socket);
            item.sendSignIn(this.receivedEvents);
            // item.getLobbyInfo();
        });
    }

    initSocketListeners() {
        this.socket.on("disconnect", this.onDisconnected.bind(this));
    }

    onDisconnected() {
        this.closeGame();
    }

    closeGame() {
        if (!this.isAlive()) {
            return;
        }
        this.socketIOController.closeSocket(this.gameId);
        this.goToLobbyScene();
    }

    private goToLobbyScene() {
        cc.director.loadScene("Lobby");
    }

    onDestroy() {
        cc.game.off(cc.game.EVENT_HIDE, this.onGameHide, this);
        cc.game.off(cc.game.EVENT_SHOW, this.onGameShow, this);
    }

    protected onGameHide() {
        //empty
    }

    protected onGameShow() {
        //empty
    }
}
