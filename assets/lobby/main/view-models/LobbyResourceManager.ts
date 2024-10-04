import GameUtils from "../../../common/GameUtils";
import { buildShareResourceGameUrl } from "../../../common/helpers/UrlHelper";
import { uiManager } from "../../../managers/GameUIManager";

interface IVersionsCache {
    banners: number;
    gameIcons: number;
    miniGameIcons: number;
}

export default class LobbyResourceManager {
    private static instance: LobbyResourceManager;
    public static readonly supportCurrencies: string[] = ["PC", "PE"];
    public static readonly themes = {
        PC: "credit_php",
        PE: "credit_php"
    };

    public static versionsCache: IVersionsCache = {
        banners: 1,
        gameIcons: 1,
        miniGameIcons: 1
    };

    private static readonly defaultPath = "lobby/themes";
    private static currentCurrency = "";

    public static getInstance(): LobbyResourceManager {
        if (!this.instance) {
            this.instance = new LobbyResourceManager();
        }

        return this.instance;
    }

    public static initLobbyResource(currency: string) {
        this.currentCurrency = currency;
        this.getRemoteVersion();
    }

    public static loadRemoteSharedResource<T>(pathResource: string) {
        return GameUtils.loadRemote<T>(this.remoteShareLobbyResourceUrl(pathResource));
    }

    public static remoteShareLobbyResourceUrl(pathResource: string) {
        const url = buildShareResourceGameUrl();
        return `${url}/lobbies/${this.getTheme()}/${pathResource}`;
    }

    public static loadPrefabResource(path: string): Promise<cc.Prefab> {
        return new Promise((resolve) => {
            cc.resources.load(`${this.getThemePath()}/prefabs/${path}`, (err, prefab: cc.Prefab) => {
                resolve(prefab);
            });
        });
    }

    protected static getThemePath() {
        if (this.supportCurrencies.includes(this.currentCurrency)) {
            return `${this.defaultPath}/${this.getTheme()}`;
        }

        return `${this.defaultPath}/default`;
    }

    public static isUseTheme() {
        return this.supportCurrencies.includes(this.currentCurrency);
    }

    protected static async loadIcon(gameId: number, type: "game" | "mini-game", cache: any): Promise<cc.SpriteFrame> {
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

    public static async loadGameIcon(gameId: number): Promise<cc.SpriteFrame> {
        return this.loadIcon(gameId, "game", uiManager.spriteFrameCache.lobbyIcons);
    }

    public static async loadMiniGameIcon(gameId: number): Promise<cc.SpriteFrame> {
        return this.loadIcon(gameId, "mini-game", uiManager.spriteFrameCache.miniPanelIcons);
    }

    public static async getRemoteVersion() {
        const versions = await this.loadRemoteSharedResource<cc.JsonAsset>(`versions.json?v=${Date.now()}`);

        versions && (this.versionsCache = versions.json);
    }

    private static getTheme() {
        return this.themes[this.currentCurrency];
    }

    public static loadRemoteInfoBanner(gameId: number) {
        return this.loadRemoteSharedResource<cc.JsonAsset>(`banners/${gameId}/info.json?v=${Date.now()}`);
    }
}
