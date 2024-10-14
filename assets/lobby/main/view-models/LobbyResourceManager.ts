import GameUtils from "../../../common/GameUtils";
import { buildShareResourceGameUrl } from "../../../common/helpers/UrlHelper";
import { uiManager } from "../../../managers/GameUIManager";

interface IVersionsCache {
    banners: number;
    gameIcons: number;
    miniGameIcons: number;
    version?: number;
}

export default class LobbyResourceManager {
    private static instance: LobbyResourceManager;
    private readonly supportGroupCurrencies: string[] = ["Credit_PHP", "Cash_PHP"];
    private readonly themes = {
        Credit_PHP: "credit_php",
        Cash_PHP: "credit_php"
    };

    public versionsCache: IVersionsCache = {
        banners: 1,
        gameIcons: 1,
        miniGameIcons: 1
    };

    private readonly defaultPath = "lobby/themes";
    private currentGroupCurrency = "";

    public static getInstance(): LobbyResourceManager {
        if (!this.instance) {
            this.instance = new LobbyResourceManager();
        }

        return this.instance;
    }

    public init(groupCurrency: string) {
        this.currentGroupCurrency = groupCurrency;
        if (this.isUseTheme()) {
            this.getRemoteVersion();
        }
    }

    public loadRemoteSharedResource<T>(pathResource: string) {
        return GameUtils.loadRemote<T>(this.remoteShareLobbyResourceUrl(pathResource));
    }

    public remoteShareLobbyResourceUrl(pathResource: string) {
        const url = buildShareResourceGameUrl();
        return `${url}/lobbies/${this.getTheme()}/${pathResource}`;
    }

    public loadPrefabResource(path: string): Promise<cc.Prefab> {
        return new Promise((resolve) => {
            cc.resources.load(`${this.getThemePath()}/prefabs/${path}`, (err, prefab: cc.Prefab) => {
                resolve(prefab);
            });
        });
    }

    protected getThemePath() {
        if (this.supportGroupCurrencies.includes(this.currentGroupCurrency)) {
            return `${this.defaultPath}/${this.getTheme()}`;
        }

        return `${this.defaultPath}/default`;
    }

    public isUseTheme() {
        return this.supportGroupCurrencies.includes(this.currentGroupCurrency);
    }

    protected async loadIcon(gameId: number, type: "game" | "mini-game", cache: any): Promise<cc.SpriteFrame> {
        const version = this.versionsCache[type === "game" ? "gameIcons" : "miniGameIcons"];
        const resourcePath = `${type}-icons/${gameId}/en.png?v=${version}`;
        const remoteTexture = await this.loadRemoteSharedResource<cc.Texture2D>(resourcePath);
        const spriteFrame = new cc.SpriteFrame(remoteTexture);

        // Cache the sprite frame
        cache[gameId] = { spriteFrame };

        if (spriteFrame) {
            return spriteFrame;
        }

        cc.log(`Not get ${type === "game" ? "Game" : "Mini Game"} Icon from shared resource: ${gameId}`);
        return null;
    }

    public async loadGameIcon(gameId: number): Promise<cc.SpriteFrame> {
        return this.loadIcon(gameId, "game", uiManager.spriteFrameCache.lobbyIcons);
    }

    public async loadMiniGameIcon(gameId: number): Promise<cc.SpriteFrame> {
        return this.loadIcon(gameId, "mini-game", uiManager.spriteFrameCache.miniPanelIcons);
    }

    public async getRemoteVersion() {
        const versions = await this.loadRemoteSharedResource<cc.JsonAsset>(`versions.json?v=${Date.now()}`);

        versions && (this.versionsCache = versions.json);
    }

    private getTheme() {
        return this.themes[this.currentGroupCurrency];
    }

    public loadRemoteInfoBanner(gameId: number) {
        return this.loadRemoteSharedResource<cc.JsonAsset>(`banners/${gameId}/info.json?v=${Date.now()}`);
    }
}
