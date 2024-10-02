import GameUtils from "../../../common/GameUtils";
import { buildShareResourceGameUrl } from "../../../common/helpers/UrlHelper";
import { StorageManager } from "../../../managers/StorageManager";

interface IVersionGroupCurrency {
    banners: string;
    "game-icons": string;
    "mini-game-icons": string;
}

export default class LobbyResourceManager {
    private static instance: LobbyResourceManager;
    public static readonly supportThemes: string[] = ["Credit_PHP", "Cash_PHP"];

    private versionGroupCurrency: Map<string, IVersionGroupCurrency> = new Map();
    private static defaultPath = "lobby/themes";
    private static currentTheme = "";

    public static getInstance(): LobbyResourceManager {
        if (!this.instance) {
            this.instance = new LobbyResourceManager();
        }

        return this.instance;
    }

    public static setCurrentTheme(theme: string) {
        this.currentTheme = theme;
    }

    public getVersionGroupCurrencyFollowKey(currencyGroup: string, key: keyof IVersionGroupCurrency): string | null {
        const versionObject = this.versionGroupCurrency.get(currencyGroup);
        if (versionObject) {
            return versionObject[key];
        }
        return null;
    }

    public updateVersion(currencyGroup: string, version: IVersionGroupCurrency): void {
        if (LobbyResourceManager.supportThemes.includes(currencyGroup)) {
            this.versionGroupCurrency.set(currencyGroup, version);
        } else {
            console.warn(`Currency group ${currencyGroup} not exist.`);
        }
    }

    public saveVersionToStorage(): void {
        // handle
    }

    public loadVersionFromStorage(): void {
        LobbyResourceManager.supportThemes.forEach((currencyGroup) => {
            const storedVersion = StorageManager.get(`${currencyGroup}_version`);
            if (storedVersion) {
                this.updateVersion(currencyGroup, storedVersion);
            }
        });
    }

    public static loadRemoteSharedResource<T>(pathResource: string) {
        return GameUtils.loadRemote<T>(this.remoteShareLobbyResourceUrl(pathResource));
    }

    public static remoteShareLobbyResourceUrl(pathResource: string) {
        const url = buildShareResourceGameUrl();
        return `${url}/lobbies/${pathResource}`;
    }

    public static loadResource(path: string): Promise<cc.Prefab> {
        return new Promise((resolve) => {
            cc.resources.load(`${this.getThemePath()}/prefabs/${path}`, (err, prefab: cc.Prefab) => {
                resolve(prefab);
            });
        });
    }

    private static getThemePath() {
        if (this.supportThemes.includes(this.currentTheme)) {
            return `${this.defaultPath}/${this.currentTheme.toLocaleLowerCase()}`;
        }

        return `${this.defaultPath}/default`;
    }

    public static isUseTheme() {
        return this.supportThemes.includes(this.currentTheme);
    }

    public static async loadGameIcon(gameId: number): Promise<cc.SpriteFrame> {
        const pathResource = `${this.currentTheme.toLowerCase()}/game-icons/${gameId}/en.png`;
        const remoteTexture = await this.loadRemoteSharedResource<cc.Texture2D>(pathResource);

        if (remoteTexture) {
            return new cc.SpriteFrame(remoteTexture);
        }

        cc.log(`Not get Game Icon from shared resource: ${gameId}`);

        return null;
    }
}
