import { lazyInject } from "../../Application";
import SocketIOController from "../../SocketIOController";
import { GatewayController } from "./gateway-controller";
import { GatewayPanel } from "./gateway-panel";

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
export class GatewayDataReceiver extends GatewayController {
    @property(cc.Prefab)
    panelPrefab: cc.Prefab = null;

    @lazyInject(SocketIOController)
    protected readonly socketIOController: SocketIOController;

    onLoad() {
        super.onLoad();

        this.init(this.store.currentGameId, this.store.lobbyId);
        this.prepareSocketAndConfig().then(() => {
            this.initOnLoad();
        });
    }

    connectSocket() {
        this.socket = this.socketIOController.createGatewayGameSocket(this.lobbyId);
        return new Promise<void>((resolve) => {
            this.socket.on("connect", () => {
                resolve();
            });
        });
    }

    init(gameId: number, lobbyId: number) {
        this.gameId = gameId;
        this.lobbyId = lobbyId;
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
