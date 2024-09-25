import GameUtils from "../../../common/GameUtils";
import { buildShareResourceGameUrl } from "../../../common/helpers/UrlHelper";
import { StorageManager } from "../../../managers/StorageManager";

interface IVersionGroupCurrency {
    banners: string;
    "game-icons": string;
    "mini-game-icons": string;
}

export default class SharedResourceManager {
    private static instance: SharedResourceManager;
    static currencyGroupList: string[] = ["Credit_PHP"];

    private versionGroupCurrency: Map<string, IVersionGroupCurrency> = new Map();

    public static getInstance(): SharedResourceManager {
        if (!this.instance) {
            this.instance = new SharedResourceManager();
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
        if (SharedResourceManager.currencyGroupList.includes(currencyGroup)) {
            this.versionGroupCurrency.set(currencyGroup, version);
        } else {
            console.warn(`Currency group ${currencyGroup} not exist.`);
        }
    }

    public saveVersionToStorage(): void {}

    public loadVersionFromStorage(): void {
        SharedResourceManager.currencyGroupList.forEach((currencyGroup) => {
            const storedVersion = StorageManager.get(`${currencyGroup}_version`);
            if (storedVersion) {
                this.updateVersion(currencyGroup, storedVersion);
            }
        });
    }

    public static loadRemoteSharedResourceLobby<T>(pathResource: string) {
        return GameUtils.loadRemote<T>(this.remoteShareLobbyResourceUrl(pathResource));
    }

    public static remoteShareLobbyResourceUrl(pathResource: string) {
        const url = buildShareResourceGameUrl();
        return `${url}/lobbies/${pathResource}`;
    }
}
