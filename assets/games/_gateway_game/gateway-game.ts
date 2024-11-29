import { lazyInject } from "../../Application";
import AudioManager from "../../common/audio/AudioManager";
import MusicPlayer from "../../common/audio/MusicPlayer";
import * as sessionManager from "../../common/auth/SessionManager";
import CategoryController from "../../common/category/category-controller";
import { CategoryEvent } from "../../common/category/category-events";
import CategoryItem from "../../common/category/category-item";
import GameUtils from "../../common/GameUtils";
import InGameMenu, { InGameMenuEvents } from "../../common/in-game-menu/InGameMenu";
import UserProfile from "../../common/user-profile/UserProfile";
import { userManager } from "../../common/user/UserManager";
import { getGameName, isGatewayGame } from "../../configs/GameConfigurations";
import { appManager } from "../../managers/AppManager";
import { uiManager } from "../../managers/GameUIManager";
import { InternalEvents } from "../../managers/InternalEvents";
import SocketIOController from "../../SocketIOController";
import { loadUserData } from "../_base/action/GameRoomActions";
import { GatewayController } from "./gateway-controller";
import GatewayGameItem from "./gateway-game-item";
const { ccclass, property } = cc._decorator;

@ccclass
export default class GatewayGame extends GatewayController {
    @property
    protected gameId = 0;

    @property(cc.Prefab)
    protected gamePrefab: cc.Prefab = null;

    @property(cc.Node)
    protected container: cc.Node = null;

    @property(cc.Node)
    loading: cc.Node = null;

    @lazyInject(SocketIOController)
    protected readonly socketIOController: SocketIOController;

    protected gameIds: number[] = [];
    protected inGameMenu: InGameMenu;
    protected userProfile: UserProfile;

    public get gameName() {
        return getGameName(this.gameId);
    }

    protected readonly CategoryFilter = "category-filter";

    async onLoad() {
        this.initOnLoadGameTable();
        uiManager.emitterListener(InternalEvents.GATEWAY_OPEN_GAME, this.handleOpenGame.bind(this), this);

        super.onLoad();

        try {
            await this.prepareSocketAndConfig();
            this.grantGameIds();

            if (this.checkReloadOpenedGame()) {
                return;
            }

            this.initOnLoad();
            this.initItems();
        } catch (e) {
            cc.log(e);
        }
    }

    initOnLoadGameTable() {
        //for room game
        appManager.currentScene = this;
        sessionManager.storeInRoomGameId(this.gameId);

        this.ensureEnableMusicPlayer();
        this.loadUserData();

        this.initEventForInGameMenu();
        cc.game.on(cc.game.EVENT_HIDE, this.onGameHide, this);
        cc.game.on(cc.game.EVENT_SHOW, this.onGameShow, this);
    }

    connectSocket() {
        this.socket = this.socketIOController.getSocketGame(this.gameId);
    }

    checkReloadOpenedGame() {
        const roomGameId = +sessionManager.getInRoomGameId();
        cc.log("checkReloadOpenedGame id", roomGameId);
        if (this.gameIds.includes(roomGameId)) {
            this.scheduleOnce(() => this.handleOpenGame(roomGameId), 0.1);
            return true;
        }
        return false;
    }

    private ensureEnableMusicPlayer() {
        MusicPlayer.getInstance().init();
    }

    loadUserData() {
        this.userProfile = this.getComponentInChildren(UserProfile);
        if (this.userProfile) {
            loadUserData(this)(userManager.user);
        }
    }

    grantGameIds() {
        const configs = this.gatewayConfig;
        this.gameIds = Object.keys(configs.games)
            .map((key) => +key)
            .filter((gameId) => userManager.offerGamesIncludeSubGames.includes(gameId) && isGatewayGame(gameId));
    }

    initItems() {
        let allCatogories = [];
        this.gameIds.forEach((gameId) => {
            const node = cc.instantiate(this.gamePrefab);

            const item = node.getComponent(GatewayGameItem);
            const gameData = this.dataGames[gameId];
            const gameName = this.getGameName(gameId);
            item.init({ gameId, gameData, gameName });
            this.container.addChild(node);

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

    initSocketListeners() {
        this.socket.on("disconnect", this.onDisconnected.bind(this));
        super.initSocketListeners();
    }

    onDisconnected() {
        this.goToLobbyScene();
    }

    isAlive() {
        return this.node?.isValid;
    }

    closeGame() {
        if (!this.isAlive()) {
            return;
        }
        this.removeSocketListeners();
    }

    private goToLobbyScene() {
        this.loading.active = true;
        this.closeGame();
        appManager.redirectToLobby();
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
        cc.log("on destroy gateway game ", this.gameId);
        cc.game.off(cc.game.EVENT_HIDE, this.onGameHide, this);
        cc.game.off(cc.game.EVENT_SHOW, this.onGameShow, this);
        appManager.currentScene = null;
        sessionManager.removeInRoomGameId();
        this.removeSocketListeners();
        uiManager.removeListenersWithTarget(this);
    }

    private removeSocketListeners() {
        if (!this.socket) {
            return;
        }

        this.socket.removeAllListeners();

        this.socketIOController.closeSocket(this.gameId);
        this.socket.disconnect();
        this.socket = null;
    }

    protected onGameHide() {
        //empty
    }

    protected onGameShow() {
        this.forceSignIn();
    }

    forceSignIn() {}

    outRoomGame() {
        this.closeGame();
    }

    handleOpenGame(gameId) {
        GameUtils.openGame(gameId, null, null, false);
    }
}
