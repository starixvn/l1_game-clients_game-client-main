import GameUtils from "../../../../common/GameUtils";
import { buildShareResource } from "../../../../common/helpers/UrlHelper";
import { ThemeManager } from "./ThemeManager";

export class ResourceLoader {
    constructor(private themeManager: ThemeManager) {}

    public loadRemoteSharedResource<T>(pathResource: string) {
        return GameUtils.loadRemote<T>(this.remoteShareLobbyResourceUrl(pathResource));
    }

    public remoteShareLobbyResourceUrl(pathResource: string) {
        const url = buildShareResource();
        return `${url}/lobbies/themes/${this.themeManager.getTheme()}/${pathResource}`;
    }

    public loadPrefab(path: string): Promise<cc.Prefab> {
        return new Promise((resolve) => {
            cc.resources.load(`${this.themeManager.getThemePath()}/prefabs/${path}`, (err, prefab: cc.Prefab) => {
                resolve(prefab);
            });
        });
    }

    public async loadRemoteInfoBanner(gameId: number) {
        return this.loadRemoteSharedResource<cc.JsonAsset>(`banners/${gameId}/info.json?v=${Date.now()}`);
    }
}
