import GameUtils from "../../../common/GameUtils";
import { buildShareResource } from "../../../common/helpers/UrlHelper";
import { uiManager } from "../../../managers/GameUIManager";

export interface IInfoLobbyTheme {
    theme: string;
    currencyGroups?: {
        [currency: string]: {
            theme: string;
        };
    };
}

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
    private readonly DEFAULT_CURRENCY_GROUP_THEME = "credit_php";

    public infoShareResource: IInfoShareResource = {
        versionBanner: 1,
        versionGameIcon: 1,
        versionMiniGameIcon: 1,
        ignoreCapitalizeGameNames: [],
        gameNamesBreakLine: {},
        gameNamesFontSize: {}
    };

    public infoLobbyTheme = {
        theme: "default",
        currencyGroups: {
            Credit_PHP: {
                theme: this.DEFAULT_CURRENCY_GROUP_THEME
            },
            Cash_PHP: {
                theme: this.DEFAULT_CURRENCY_GROUP_THEME
            }
        }
    };

    private readonly DEFAULT_PATH = "lobby/themes";
    private currentGroupCurrency = "";

    public static getInstance(): LobbyResourceManager {
        if (!this.instance) {
            this.instance = new LobbyResourceManager();
        }

        return this.instance;
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

    public init(groupCurrency?: string) {
        this.getInfoTheme()
            .then(() => {
                if (groupCurrency) {
                    this.currentGroupCurrency = groupCurrency;
                    if (this.isUseTheme()) {
                        this.getRemoteVersion();
                    }
                }
            })
            .catch((err) => {
                cc.error("Failed to get info theme:", err);
            });
    }

    public loadRemoteSharedResource<T>(pathResource: string) {
        return GameUtils.loadRemote<T>(this.remoteShareLobbyResourceUrl(pathResource));
    }

    public remoteShareLobbyResourceUrl(pathResource: string) {
        const url = buildShareResource();
        return `${url}/lobbies/themes/${this.getTheme()}/${pathResource}`;
    }

    public loadPrefab(path: string): Promise<cc.Prefab> {
        return new Promise((resolve) => {
            cc.resources.load(`${this.getThemePath()}/prefabs/${path}`, (err, prefab: cc.Prefab) => {
                resolve(prefab);
            });
        });
    }

    public getThemePath() {
        // Check if current currency group exists in lobby theme config
        // If yes, return path with theme from currency group
        // Example: lobby/themes/credit_php for Credit_PHP currency
        if (this.currentGroupCurrency in this.infoLobbyTheme.currencyGroups) {
            return `${this.DEFAULT_PATH}/${this.getTheme()}`;
        }

        return `${this.DEFAULT_PATH}/${this.infoLobbyTheme.theme}`;
    }

    public isUseTheme() {
        return this.currentGroupCurrency in this.infoLobbyTheme.currencyGroups;
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

    protected async getRemoteVersion() {
        const versions = await this.loadRemoteSharedResource<cc.JsonAsset>(`info.json?v=${Date.now()}`);

        versions && (this.infoShareResource = versions.json);
    }

    protected async getInfoTheme() {
        const url = `${buildShareResource()}/lobbies/themes/info.json?v=${Date.now()}`;
        const infoTheme = await GameUtils.loadRemote<cc.JsonAsset>(url);

        infoTheme && (this.infoLobbyTheme = infoTheme.json);
    }

    private getTheme() {
        return this.infoLobbyTheme.currencyGroups[this.currentGroupCurrency].theme ?? this.DEFAULT_CURRENCY_GROUP_THEME;
    }

    public loadRemoteInfoBanner(gameId: number) {
        return this.loadRemoteSharedResource<cc.JsonAsset>(`banners/${gameId}/info.json?v=${Date.now()}`);
    }
}

export const lobbyResourceManager = LobbyResourceManager.getInstance();
