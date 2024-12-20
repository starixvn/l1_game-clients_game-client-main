import GameUtils from "../../../common/GameUtils";
import { buildShareResource } from "../../../common/helpers/UrlHelper";
import { GameIconLoader } from "./theme/GameIconLoader";
import { GameNameManager } from "./theme/GameNameManager";
import { ResourceLoader } from "./theme/ResourceLoader";
import { ThemeManager } from "./theme/ThemeManager";

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

    public themeManager: ThemeManager;
    public resourceLoader: ResourceLoader;
    public gameIconLoader: GameIconLoader;
    public gameNameManager: GameNameManager;

    public static getInstance(): LobbyResourceManager {
        if (!this.instance) {
            this.instance = new LobbyResourceManager();
        }

        return this.instance;
    }

    public async init(groupCurrency?: string) {
        try {
            await this.getInfoTheme();
            this.themeManager = new ThemeManager(this.infoLobbyTheme, this.DEFAULT_CURRENCY_GROUP_THEME);
            this.resourceLoader = new ResourceLoader(this.themeManager);
            this.gameIconLoader = new GameIconLoader(this);

            if (groupCurrency) {
                this.themeManager?.setCurrentGroupCurrency(groupCurrency);
                if (this.themeManager?.isUseTheme()) {
                    try {
                        await this.getRemoteVersion();
                        this.gameNameManager = new GameNameManager(this.infoShareResource);
                    } catch (err) {
                        cc.error("Failed to initialize game name manager:", err);
                    }
                }
            }
        } catch (err) {
            cc.error("Failed to initialize lobby resource manager:", err);
        }
    }

    protected async getInfoTheme() {
        const url = `${buildShareResource()}/lobbies/themes/info.json?v=${Date.now()}`;
        const infoTheme = await GameUtils.loadRemote<cc.JsonAsset>(url);

        infoTheme && (this.infoLobbyTheme = infoTheme.json);
    }

    protected async getRemoteVersion() {
        const versions = await this.resourceLoader?.loadRemoteSharedResource<cc.JsonAsset>(`info.json?v=${Date.now()}`);

        versions && (this.infoShareResource = versions.json);
    }
}

export const lobbyResourceManager = LobbyResourceManager.getInstance();
