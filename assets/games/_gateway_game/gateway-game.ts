import { Socket } from "socket.io-client";
import { lazyInject } from "../../Application";
import AudioManager from "../../common/audio/AudioManager";
import * as sessionManager from "../../common/auth/SessionManager";
import BaseComponent from "../../common/BaseComponent";
import CategoryController from "../../common/category/category-controller";
import { CategoryEvent } from "../../common/category/category-events";
import CategoryItem from "../../common/category/category-item";
import GameUtils from "../../common/GameUtils";
import InGameMenu, { InGameMenuEvents } from "../../common/in-game-menu/InGameMenu";
import UserProfile from "../../common/user-profile/UserProfile";
import { userManager } from "../../common/user/UserManager";
import { getGameName } from "../../configs/GameConfigurations";
import { appManager } from "../../managers/AppManager";
import SocketIOController from "../../SocketIOController";
import { loadUserData } from "../_base/action/GameRoomActions";
import GatewayGameItem from "./gateway-game-item";
const { ccclass, property } = cc._decorator;
type CategoryJson = { [key: string]: string[] };
type ServiceNameJson = { [key: string]: number[] };
interface GameConfigJson {
    gameId: number;
    games: CategoryJson;
    receivedEvents: string[];
    serviceName: ServiceNameJson;
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
    protected categoryJson: CategoryJson;
    protected serviceNameJson: ServiceNameJson;
    protected inGameMenu: InGameMenu;
    protected userProfile: UserProfile;

    public get gameName() {
        return getGameName(this.gameId);
    }
    protected readonly CategoryFilter = "category-filter";

    onLoad() {
        this.loadUserData();
        this.loadConfigs();
        this.initSocket();
        this.initItems();
        this.initEventForInGameMenu();
        cc.game.on(cc.game.EVENT_HIDE, this.onGameHide, this);
        cc.game.on(cc.game.EVENT_SHOW, this.onGameShow, this);
        //for room game
        appManager.currentScene = this;
    }

    loadUserData() {
        this.userProfile = this.getComponentInChildren(UserProfile);
        if (this.userProfile) {
            loadUserData(this)(userManager.user);
        }
    }

    loadConfigs() {
        const configs = this.configs.json as GameConfigJson;
        this.gameId = configs.gameId;
        this.gameIds = Object.keys(configs.games)
            .map((key) => +key)
            .filter((gameId) => userManager.offerGames.includes(gameId));
        this.receivedEvents = configs.receivedEvents;
        this.categoryJson = configs.games;
        this.serviceNameJson = configs.serviceName;

        sessionManager.storeInRoomGameId(this.gameId);
    }

    initSocket() {
        this.socket = this.socketIOController.getSocketGame(this.gameId);
        if (this.socket) {
            this.initSocketListeners();
        }
    }

    getServiceName(gameId: number) {
        return Object.keys(this.serviceNameJson).find((key) => this.serviceNameJson[key].includes(gameId)) ?? "";
    }

    initItems() {
        let allCatogories = [];
        this.gameIds.forEach((gameId) => {
            const node = cc.instantiate(this.gamePrefab);
            this.container.addChild(node);

            const item = node.getComponent(GatewayGameItem);
            const serviceName = this.getServiceName(gameId);
            item.init(gameId, serviceName, this.socket);
            item.sendSignIn(this.receivedEvents);

            const categories = this.getCategory(gameId);
            allCatogories.push(...categories);
            categories.forEach((category) => {
                const comp = item.addComponent(CategoryItem);
                comp.category = category;
            });
        });

        allCatogories = allCatogories.filter(
            (iterator, index, categories) => categories?.findIndex((category) => category === iterator) === index
        );

        const comp = this.getComponentInChildren(CategoryController);
        if (comp) {
            const data = GameUtils.getSpecificGameSetting(this.GatewayGameSetting);
            const savedFilter = data[this.CategoryFilter] ?? [];
            comp.node.on(CategoryEvent.Changed, this.saveCategoryFilter, this);
            comp.initCategories(allCatogories, savedFilter);
        }
    }

    get GatewayGameSetting() {
        return `gateway-${this.gameId}`;
    }

    saveCategoryFilter(categories: string[]) {
        const data = GameUtils.getSpecificGameSetting(this.GatewayGameSetting);
        data[this.CategoryFilter] = categories;
        GameUtils.setSpecificGameSetting(this.GatewayGameSetting, data);
    }

    getCategory(gameId: number) {
        return this.categoryJson[gameId];
    }

    initSocketListeners() {
        this.socket.off("message");
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
