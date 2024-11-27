import { Socket } from "socket.io-client";
import { lazyInject } from "../../Application";
import { getSession } from "../../common/auth/SessionManager";
import GameUtils from "../../common/GameUtils";
import { buildSharedResourceUrl } from "../../common/helpers/UrlHelper";
import { userManager } from "../../common/user/UserManager";
import SocketIOController from "../../SocketIOController";
import { GatewayPanel } from "./gateway-panel";
import { GatewayPanelStoreEvent } from "./gateway-panel-store-event";
import { GatewayPanelStoreObserver } from "./gateway-panel-store-observer";
import { GoodRoadCounterHandler } from "./good-road/good-road-counter-handler";
import { DisableGameHandler } from "./handlers/disable-game-handler";
import { GameInfoHandler } from "./handlers/game-info-handler";
import { RoundHistoryHandler } from "./handlers/round-history-handler";
import { EmitterEvents } from "./models/definitions";
import { DisableGameStore } from "./models/disable-game-store";
import { GameInfoStore } from "./models/game-info-store";
import { GameData } from "./models/gateway-game-data";
import { RoundHistoryStore } from "./models/round-history-store";

const { ccclass, property } = cc._decorator;

export interface IGatewayConfigs {
    gameId: number;
    games: Record<number, string[]>;
    durations: {
        default: IDurationDetails;
        speed: IDurationDetailsWithIds;
        blockchain: IDurationDetailsWithIds;
    };
    serviceName: {
        default: IServiceNameDetails;
        old: IServiceNameDetailsWithIds;
        blockchain: IServiceNameDetailsWithIds;
    };
    receivedEvents: string[];
}

interface IDurationDetails {
    value: IDurationValues;
}

interface IDurationDetailsWithIds extends IDurationDetails {
    ids: number[];
}

interface IDurationValues {
    wholeRound: number;
    wholeShoe: number;
    lockingBet: number;
    placingBet: number;
    generatingResult: number;
    showingResult: number;
    startRound: number;
}

interface IServiceNameDetails {
    value: string;
}

interface IServiceNameDetailsWithIds extends IServiceNameDetails {
    ids: number[];
}

@ccclass
export class GatewayDataReceiver extends GatewayPanelStoreObserver {
    @property(cc.Prefab)
    panelPrefab: cc.Prefab = null;

    @property(GoodRoadCounterHandler)
    goodRoadCounterHandler: GoodRoadCounterHandler = null;

    @lazyInject(SocketIOController)
    protected readonly socketIOController: SocketIOController;

    socket: Socket = null;

    gatewayConfig: IGatewayConfigs = null;

    rtps: { [gameId: number]: number } = {};
    dataGames = {}; //gameId : gameData
    gameId = -1;
    lobbyId = -1;
    offerGames = [];

    onLoad() {
        super.onLoad();

        this.init(this.store.currentGameId, this.store.lobbyId);

        this.store.node.on(GatewayPanelStoreEvent.ChangeEventGameSignIn, this.renderEventGameSignIn.bind(this), this);
    }

    init(gameId: number, lobbyId: number) {
        this.gameId = gameId;
        this.lobbyId = lobbyId;
        this.offerGames = userManager.offerGamesIncludeSubGames;
        this.getGatewayConfig().then(() => {
            this.createDefaultRTP();
            this.createGameDatas();
            this.initGoodRoadCounterHandler();
            this.initSocket();
        });
    }

    renderEventGameSignIn(event: { gameId: number }) {
        if (event.gameId) {
            this.sendSignInEachGame(event.gameId);
        }
    }

    createDefaultRTP() {
        const games = this.getFilterGames();
        for (const gameId of games) {
            this.rtps[gameId] = 98;
        }
        this.updateRTPOrderGameIds();
    }

    private initSocket() {
        this.socket = this.socketIOController.createGatewayGameSocket(this.lobbyId);
        this.socket.on("connect", () => {
            this.socket.onAny(this.filterDataGame);
            this.sendSignInAllGames();
        });
    }

    async getGatewayConfig() {
        try {
            const configUrl = buildSharedResourceUrl(`gateway/${this.lobbyId}/info.json?v=${Date.now()}`);
            const jsonAsset = await GameUtils.loadRemote<cc.JsonAsset>(configUrl);
            this.gatewayConfig = (jsonAsset?.json as IGatewayConfigs) ?? null;
        } catch (error) {
            cc.log("Get Gateway config failed!");
        }
    }

    getFilterGames() {
        if (this.offerGames.length === 0) {
            cc.warn("offerGames is empty!");
            return [];
        }
        const games = Object.keys(this.gatewayConfig?.games)
            .map((gameId) => +gameId)
            .filter((gameId) => gameId !== this.gameId && this.offerGames.includes(gameId));
        return games;
    }

    createGameDatas() {
        const games = this.getFilterGames();
        games.forEach((gameId) => {
            this.dataGames[gameId] = this.createGameData(gameId);
        });
    }

    initGoodRoadCounterHandler() {
        this.goodRoadCounterHandler.init(this.dataGames);
    }

    createGameData(gameId: number) {
        const durations = this.getDurations(gameId);
        const gameData = new GameData();
        gameData.initHandlers([RoundHistoryHandler, GameInfoHandler, DisableGameHandler]);

        const infoStore = new GameInfoStore();
        infoStore.durations = durations;
        const disableGameStore = new DisableGameStore();
        disableGameStore.addListener(EmitterEvents.GetLobbyData, () => this.sendSignInEachGame(gameId), this);
        gameData.addStores([new RoundHistoryStore(), infoStore, disableGameStore]);
        return gameData;
    }

    filterDataGame = (event: string, data: any) => {
        const eventLowerCase = event.toLocaleLowerCase();

        if (eventLowerCase === "message") {
            const gameName = data.gameName?.toLocaleLowerCase();
            this.onData(data, gameName);
        } else {
            this.onData(data, eventLowerCase);
        }
    };

    onData(data: any, gameName: string) {
        if (data.signedIn) {
            this.onSignedIn(gameName);
            return;
        }
        const gameId = this.convertGameNameToId(gameName);
        this.handleDataRtp(data, gameId);
        this.publishDataEachGame(data, gameId);
    }

    convertGameNameToId(gameName: string) {
        const games = this.getFilterGames();
        return games.find((gameId) => this.getGameName(gameId).toLowerCase() === gameName);
    }

    publishDataEachGame(data: any, gameId: number) {
        const gameData = this.dataGames[gameId];
        if (gameData) {
            gameData.receiveData(data);
        }
    }

    handleDataRtp(data: any, gameId: number) {
        if (data.rtp) {
            this.rtps[gameId] = data.rtp;

            this.updateRTPOrderGameIds();
        }
    }

    updateRTPOrderGameIds() {
        const gameIds = this.getFilterGames();
        gameIds.sort((a, b) => this.rtps[b] - this.rtps[a]);

        this.store.updateOrderGameIds(gameIds);
    }

    sendSignInAllGames() {
        const games = this.getFilterGames();
        games.forEach((gameId) => {
            this.sendSignInEachGame(+gameId);
        });
    }

    getGameName(gameId: number) {
        if (gameId === 27) {
            return "VipBaccarat";
        }
        if (gameId === 48) {
            return "BlockchainBaccarat";
        }
        return `Bac${gameId}`;
    }

    getServiceName(gameId: number) {
        const info = this.gatewayConfig?.serviceName;
        const type = Object.keys(info).find((key) => info[key].ids?.includes(gameId)) ?? "default";
        return info[type].value;
    }

    getDurations(gameId: number) {
        const info = this.gatewayConfig?.durations;
        const type = Object.keys(info).find((key) => info[key].ids?.includes(gameId)) ?? "default";
        return info[type].value;
    }

    getCategory(gameId: number) {
        return this.gatewayConfig?.games[gameId];
    }

    sendSignInEachGame(gameId: number) {
        const data = {
            gameName: this.getGameName(gameId),
            receivedEvents: this.gatewayConfig?.receivedEvents,
            session: getSession()
        };
        const serviceName = this.getServiceName(gameId);
        if (serviceName !== "") {
            data["serviceName"] = serviceName;
        }
        this.socket.emit("signIn", data);
    }

    onSignedIn(gameName: string) {
        this.getLobbyData(gameName);
    }

    getLobbyData(gameName: string) {
        this.socket.emit("getLobbyData", { gameName: gameName });
    }

    onOpenSidePanel() {
        const node = cc.instantiate(this.panelPrefab);

        const panel = node.getComponent(GatewayPanel);

        const games = this.getFilterGames();
        const info = {};
        games?.forEach((gameId) => {
            const gameName = this.getGameName(gameId);
            info[gameId] = {
                gameName,
                categories: this.getCategory(gameId)
            };
        });

        panel.initItems(this.dataGames, info);
        this.node.addChild(node);
    }
}
