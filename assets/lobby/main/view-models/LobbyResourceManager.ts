import GameUtils from "../../../common/GameUtils";
import { buildShareResourceGameUrl } from "../../../common/helpers/UrlHelper";
import UserManager from "../../../common/user/UserManager";
import { StorageManager } from "../../../managers/StorageManager";

interface IVersionGroupCurrency {
    banners: string;
    "game-icons": string;
    "mini-game-icons": string;
}

export default class LobbyResourceManager {
    private static instance: LobbyResourceManager;
    public static readonly themeNames: string[] = ["Credit_PHP"];

    private versionGroupCurrency: Map<string, IVersionGroupCurrency> = new Map();
    private static defaultPath = "lobby/themes";

    public static getInstance(): LobbyResourceManager {
        if (!this.instance) {
            this.instance = new LobbyResourceManager();
        }

        return this.instance;
    }

    public getVersionGroupCurrencyFollowKey(currencyGroup: string, key: keyof IVersionGroupCurrency): string | null {
        const versionObject = this.versionGroupCurrency.get(currencyGroup);
        if (versionObject) {
            return versionObject[key];
        }
        return null;
    }

    public updateVersion(currencyGroup: string, version: IVersionGroupCurrency): void {
        if (LobbyResourceManager.themeNames.includes(currencyGroup)) {
            this.versionGroupCurrency.set(currencyGroup, version);
        } else {
            console.warn(`Currency group ${currencyGroup} not exist.`);
        }
    }

    public saveVersionToStorage(): void {
        // handle
    }

    public loadVersionFromStorage(): void {
        LobbyResourceManager.themeNames.forEach((currencyGroup) => {
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
            cc.resources.load(`${LobbyResourceManager.getThemePath()}${path}`, (err, prefab: cc.Prefab) => {
                resolve(prefab);
            });
        });
    }

    private static getThemePath() {
        const currencyGroup = UserManager.getInstance()?.currencyGroup;
        if (LobbyResourceManager.themeNames.includes(currencyGroup)) {
            return `${LobbyResourceManager.defaultPath}/${currencyGroup.toLocaleLowerCase()}/`;
        }

        return `${LobbyResourceManager.defaultPath}/default/`;
    }
}
