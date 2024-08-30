import { Socket } from "socket.io-client";
import { lazyInject } from "../../Application";
import AudioManager from "../../common/audio/AudioManager";
import * as sessionManager from "../../common/auth/SessionManager";
import BaseComponent from "../../common/BaseComponent";
import CategoryItem from "../../common/category/category-item";
import InGameMenu, { InGameMenuEvents } from "../../common/in-game-menu/InGameMenu";
import { getGameName } from "../../configs/GameConfigurations";
import { appManager } from "../../managers/AppManager";
import SocketIOController from "../../SocketIOController";
import GatewayGameItem from "./gateway-game-item";
const { ccclass, property } = cc._decorator;
interface CategoriesJson {
    all: number[];
    lucky: number[];
    classic: number[];
    vip: number[];
}
interface GameConfigJson {
    gameId: number;
    gameIds: number[];
    categories: CategoriesJson;
    receivedEvents: string[];
}

@ccclass
export default class GatewayGame extends BaseComponent {
    @property(cc.JsonAsset)
    protected configs: cc.JsonAsset = null;

    @property(cc.Prefab)
    protected gamePrefab: cc.Prefab = null;

    @property(cc.Node)
    protected container: cc.Node = null;

    @lazyInject(SocketIOController)
    protected readonly socketIOController: SocketIOController;
    protected socket: Socket;
    protected gameId = 0;
    protected gameIds: number[] = [];
    protected receivedEvents: string[] = [];
    protected categories: CategoriesJson;
    protected inGameMenu: InGameMenu;

    public get gameName() {
        return getGameName(this.gameId);
    }

    onLoad() {
        this.loadConfigs();
        this.initSocket();
        this.initItems();
        this.initEventForInGameMenu();
        cc.game.on(cc.game.EVENT_HIDE, this.onGameHide, this);
        cc.game.on(cc.game.EVENT_SHOW, this.onGameShow, this);
        //for room game
        appManager.currentScene = this;
    }

    loadConfigs() {
        const configs = this.configs.json as GameConfigJson;
        this.gameId = configs.gameId;
        this.gameIds = configs.gameIds;
        this.receivedEvents = configs.receivedEvents;
        this.categories = configs.categories;

        sessionManager.storeInRoomGameId(this.gameId);
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

            const categories = this.getCategory(gameId);
            categories.forEach((category) => {
                const comp = item.addComponent(CategoryItem);
                comp.category = category;
            });
        });
    }

    getCategory(gameId: number) {
        const list = Object.keys(this.categories).flatMap((category) => {
            if (this.categories[category].includes(gameId)) {
                return [category];
            } else {
                return [];
            }
        });
        console.log(`Categories:`, list);
        return list;
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
        sessionManager.removeInRoomGameId();
    }

    private goToLobbyScene() {
        this.closeGame();
        cc.director.loadScene("Lobby");
    }

    initEventForInGameMenu() {
        const inGameMenu = cc.director.getScene().getComponentInChildren(InGameMenu);
        if (inGameMenu) {
            this.inGameMenu = inGameMenu;
            const node = inGameMenu.node;
            node.on(InGameMenuEvents.OPEN_HISTORY, this.openHistory, this);
            node.on(InGameMenuEvents.OPEN_GUIDE, this.openGuide, this);
            node.on(InGameMenuEvents.GO_TO_LOBBY, this.goToLobbyScene, this);
        }
    }

    openHistory() {
        AudioManager.getInstance().playClick();
    }

    openGuide() {
        AudioManager.getInstance().playClick();
    }

    onDestroy() {
        cc.game.off(cc.game.EVENT_HIDE, this.onGameHide, this);
        cc.game.off(cc.game.EVENT_SHOW, this.onGameShow, this);
        appManager.currentScene = null;
    }

    protected onGameHide() {
        //empty
    }

    protected onGameShow() {
        //empty
    }

    outRoomGame() {
        this.closeGame();
    }
}
