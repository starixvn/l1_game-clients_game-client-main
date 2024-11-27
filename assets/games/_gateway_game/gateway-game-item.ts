import GameUtils from "../../common/GameUtils";
import LazyloadSprite from "../../common/LazyloadSprite";
import { uiManager } from "../../managers/GameUIManager";
import { InternalEvents } from "../../managers/InternalEvents";
import { GatewayPanelStoreObserver } from "./gateway-panel-store-observer";
import { GameDataBase } from "./models/game-data-base";
import RenderItem from "./render-item/render-item";
const { ccclass, property } = cc._decorator;
@ccclass
export default class GatewayGameItem extends GatewayPanelStoreObserver {
    @property(cc.Label)
    labelGameName: cc.Label = null;

    @property(cc.Node)
    loading: cc.Node = null;

    renderItems: RenderItem[] = [];
    gameId = 0;
    gameName = "";
    gameData: GameDataBase = null;

    initRenderItems() {
        this.renderItems = this.getComponentsInChildren(RenderItem);
        this.renderItems.forEach((item) => item.init(this.gameData));
    }

    init(settings: { gameId: number; gameName: string; gameData: GameDataBase }) {
        const { gameId, gameName, gameData } = settings;
        this.gameId = gameId;
        this.gameName = gameName;
        this.gameData = gameData;
        this.updateGameName(this.gameId);
        this.initRenderItems();

        this.loadLazyloadSprites();
        this.initUIListeners();
    }

    initUIListeners() {
        uiManager.emitterListener(
            InternalEvents.GATEWAY_OPEN_GAME,
            (gameId) => {
                this.loading.active = gameId === this.gameId;
            },
            this
        );
    }

    loadLazyloadSprites() {
        const lazyloadSprites = this.getComponentsInChildren(LazyloadSprite);
        lazyloadSprites.forEach((sprite) => {
            sprite.suffix = `-${this.gameId}`;
            sprite.loadSprite();
        });
    }

    onDestroy() {
        uiManager.removeListenersWithTarget(this);
        this.gameData = null;
    }

    async updateGameName(gameId: number) {
        try {
            this.labelGameName.string = await GameUtils.getDisplayGameName(gameId);
            if (this.labelGameName.string === "") {
                this.labelGameName.string = `Game___${gameId}`;
            }
        } catch (e) {}
    }

    callGameSignIn() {
        this.store.callGameSignIn(this.gameId);
    }

    onReconnectGame() {
        this.callGameSignIn();
    }

    onClickOpenGame() {
        this.gameData.clearStoreListeners();
        uiManager.emitter.emit(InternalEvents.GATEWAY_OPEN_GAME, this.gameId);
    }
}
