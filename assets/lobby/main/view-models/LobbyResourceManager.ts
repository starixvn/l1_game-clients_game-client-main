import GameUtils from "../../../common/GameUtils";
import { buildShareResourceGameUrl } from "../../../common/helpers/UrlHelper";
import { uiManager } from "../../../managers/GameUIManager";

export interface IInfoShareResource {
    versionBanner: number;
    versionGameIcon: number;
    versionMiniGameIcon: number;
    ignoreCapitalizeGameNames: number[];
    gameNamesBreakLine: IGameNamesBreakLine;
    gameNamesFontSize: IGameNamesFontSize;
}

export interface IInfoShareResourceBanner {
    premultipliedAlpha: boolean;
    languages: LanguagesConfig;
    version?: number;
}

interface LanguagesConfig {
    en: boolean;
    vi?: boolean;
    th?: boolean;
    id?: boolean;
    zh_cn?: boolean;
    zh_tw?: boolean;
}

interface IGameNamesBreakLine {
    [gameId: string]: {
        [languageCode: string]: string;
    };
}

interface IGameNamesFontSize {
    [gameId: string]: {
        [languageCode: string]: number;
    };
}

export default class LobbyResourceManager {
    private static instance: LobbyResourceManager;
    private readonly supportGroupCurrencies: string[] = ["Credit_PHP", "Cash_PHP"];
    private readonly themes = {
        Credit_PHP: "credit_php",
        Cash_PHP: "credit_php"
    };

    public infoShareResource: IInfoShareResource = {
        versionBanner: 1,
        versionGameIcon: 1,
        versionMiniGameIcon: 1,
        ignoreCapitalizeGameNames: [],
        gameNamesBreakLine: {},
        gameNamesFontSize: {}
    };

    private readonly defaultPath = "lobby/themes";
    private currentGroupCurrency = "";

    public static getInstance(): LobbyResourceManager {
        if (!this.instance) {
            this.instance = new LobbyResourceManager();
        }

        return this.instance;
    }
    public static init(groupCurrency: string) {
        return this.getInstance().init(groupCurrency);
    }

    public static loadPrefab(path: string): Promise<cc.Prefab> {
        return this.getInstance().loadPrefab(path);
    }

    public static isUseTheme() {
        return this.getInstance().isUseTheme();
    }

    public getIgnoreCapitalizeGameNames() {
        return this.infoShareResource.ignoreCapitalizeGameNames;
    }

    public getGameNameBreakLine(gameId: number, lang: string) {
        return this.infoShareResource.gameNamesBreakLine?.[gameId]?.[lang];
    }

    public getGameNamesFontSize(gameId: number, lang: string) {
        return this.infoShareResource.gameNamesFontSize?.[gameId]?.[lang];
    }

    protected init(groupCurrency: string) {
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

    protected loadPrefab(path: string): Promise<cc.Prefab> {
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

    protected isUseTheme() {
        return this.supportGroupCurrencies.includes(this.currentGroupCurrency);
    }

    protected async loadIcon(gameId: number, type: "game" | "mini-game", cache: any): Promise<cc.SpriteFrame> {
        const version = this.infoShareResource[type === "game" ? "versionGameIcon" : "versionMiniGameIcon"];
        const resourcePath = `${type}-icons/${gameId}/en.webp?v=${version}`;
        const remoteTexture = await this.loadRemoteSharedResource<cc.Texture2D>(resourcePath);
        const spriteFrame = new cc.SpriteFrame(remoteTexture);
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
        const versions = await this.loadRemoteSharedResource<cc.JsonAsset>(`info.json?v=${Date.now()}`);

        versions && (this.infoShareResource = versions.json);
    }

    private getTheme() {
        return this.themes[this.currentGroupCurrency];
    }

    public loadRemoteInfoBanner(gameId: number) {
        return this.loadRemoteSharedResource<cc.JsonAsset>(`banners/${gameId}/info.json?v=${Date.now()}`);
    }
}
