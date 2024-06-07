import { lazyInject } from "../../../Application";
import GameUtils from "../../../common/GameUtils";
import RemoteSpine from "../../../common/RemoteSpine";
import { getLocale } from "../../../common/auth/SessionManager";
import Loading from "../../../common/loading/view-models/Loading";
import { getGameConfiguration } from "../../../configs/GameConfigurations";
import { SkeletonCache, uiManager } from "../../../managers/GameUIManager";
import SplashConfig from "../../../splash/view-models/SplashConfig";
import GameNotification from "./GameNotification";
import LobbyMenuConfig from "./LobbyMenuConfig";

const { ccclass, property } = cc._decorator;

interface GameNotificationConfig {
    type: string;
    x?: number;
    y?: number;
}
interface RemoteIconConfig {
    gameNotification?: GameNotificationConfig;
    premultipliedAlpha: boolean;
}

@ccclass
export default class SkeletonIcon extends cc.Component {
    @property(cc.Label)
    gameName: cc.Label = null;

    @property(cc.Node)
    gameContent: cc.Node = null;

    @property(cc.Node)
    lightTop: cc.Node = null;

    @property(cc.Node)
    skeletonLoading: cc.Node = null;

    @property(cc.Node)
    newTag: cc.Node = null;

    @property(Loading)
    gameLoading: Loading = null;

    @lazyInject(LobbyMenuConfig)
    private readonly lobbyMenuConfig: LobbyMenuConfig;

    @lazyInject(SplashConfig)
    protected readonly splashConfig: SplashConfig;

    protected onLoad(): void {
        this.gameName.node.active = false;
    }

    private readonly micrositeIconCache: SkeletonCache = uiManager.remoteIconCache;

    setGameName(text: string, gameId: number) {
        const transformersGameId = 70;
        const transformersLabelFontSize = 23;
        this.gameName.node.active = true;
        this.gameName.string = text;
        const language = getLocale();
        if (gameId === transformersGameId) {
            if (language === "en-US" || language === "id-ID") {
                this.gameName.fontSize = transformersLabelFontSize;
            }
        }
    }
    static listGameWithoutHide = [];

    setGameContent(id: number, gameIconIndex: number, categoryIndex: number, addListIconObscure: (icon: SkeletonIcon) => void) {
        const cachedGameIcon = GameUtils.cachedGameIcon(id);

        if (!!cachedGameIcon) {
            this.loadAnimation(id, categoryIndex);
        } else {
            addListIconObscure(this);
        }
    }

    private async createIconNode(id: number) {
        try {
            let prefab: cc.Prefab;
            if (uiManager.prefabCache.lobbyIcons[id]) {
                prefab = uiManager.prefabCache.lobbyIcons[id];
            } else {
                prefab = await GameUtils.loadGameIcon(id);
                if (!prefab) {
                    prefab = await GameUtils.loadGameIcon(id, this.splashConfig.customPath);
                }
            }
            return cc.instantiate(prefab);
        } catch (error) {
            cc.log(error);
            return null;
        }
    }

    private async createRemoteIconNode(id: number) {
        const node = new cc.Node();
        try {
            const configFile = this.micrositeIconCache[id]
                ? this.micrositeIconCache[id].configFile
                : await GameUtils.loadRemoteGameResource<cc.JsonAsset>(id, `icon/config.json`);

            this.micrositeIconCache[id] = {
                ...this.micrositeIconCache[id],
                configFile
            };
            const iconConfig: RemoteIconConfig = configFile?.json;

            node.addComponent(sp.Skeleton);
            const remoteSpine = node.addComponent(RemoteSpine);
            const url = GameUtils.remoteGameResourceUrl(id, "icon");
            remoteSpine.id = id;
            remoteSpine.host = url;
            remoteSpine.spineName = "icon-game";
            remoteSpine.premultipliedAlpha = iconConfig ? iconConfig.premultipliedAlpha : false;
            await remoteSpine.init(this.micrositeIconCache);
            if (iconConfig?.gameNotification) {
                this.addGameNotificationComponent(node, id, iconConfig?.gameNotification);
            }
        } catch (error) {
            cc.log(error);
            return null;
        }
        return node;
    }

    private async addGameNotificationComponent(node: cc.Node, id: number, gameNotification: GameNotificationConfig) {
        const notification = node.addComponent(GameNotification);
        notification.gameId = id;

        const type = gameNotification.type;
        const labelPrefabName = `label-${type}`;
        const prefab = await GameUtils.loadResource(`lobby/games/remote-icon/${labelPrefabName}`);
        const labelNode = cc.instantiate(prefab);
        node?.addChild(labelNode);
        labelNode.position = labelNode.position.add(cc.v3(gameNotification.x, gameNotification.y));
        labelNode.active = false;
        notification.noticeNode = labelNode;
    }

    public async loadAnimation(id: number, categoryIndex = 0) {
        const gameConfiguration = getGameConfiguration(id);
        const gameNode = GameUtils.isMicroSite(gameConfiguration) ? await this.createRemoteIconNode(id) : await this.createIconNode(id);
        if (gameNode) {
            this.hideSkeleton();
            this.gameContent?.addChild(gameNode);
            this.newTag && (this.newTag.active = this.lobbyMenuConfig.isNewGame(id, categoryIndex));
        }
    }

    private hideSkeleton() {
        this.lightTop && (this.lightTop.active = false);
        this.skeletonLoading && (this.skeletonLoading.active = false);
    }
}
