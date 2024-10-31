import { BundleManager } from "bundle-management";
import { getGameConfiguration } from "../configs/GameConfigurations";
import { TotalPreloadGameIcon } from "../constants";
import LobbyManager from "../lobby/main/view-models/LobbyManager";
import LobbyResourceManager from "../lobby/main/view-models/LobbyResourceManager";
import SkeletonBannerTheme from "../lobby/main/view-models/theme/SkeletonBannerTheme";
import { uiManager } from "../managers/GameUIManager";
import { StorageManager } from "../managers/StorageManager";
import GameUtils from "./GameUtils";
import { userManager } from "./user/UserManager";

export const MICRO_GAMES_NOT_OFFER_BANNER = [9, 48, 49, 50];
export enum BannerType {
    SingleImage = "singleImage",
    Prefab = "prefab"
}

export default class LobbyUtils {
    public static cachedGameIcon(gameId: number) {
        const gameConfiguration = getGameConfiguration(gameId);
        const isMicrosite = GameUtils.isMicroSite(gameConfiguration);
        return !!isMicrosite ? uiManager.remoteIconCache[gameId] : uiManager.prefabCache.lobbyIcons[gameId];
    }

    public static async getBannerPrefab(data: { id: number; remoteBundle; systemPath: string }) {
        const { id, remoteBundle, systemPath } = data;
        let banner: cc.Prefab;

        if (!!remoteBundle && !MICRO_GAMES_NOT_OFFER_BANNER.includes(id)) {
            const path =
                systemPath === ""
                    ? `banners/${GameUtils.getCurrentLanguage()}/banner`
                    : `banners/${systemPath}/${GameUtils.getCurrentLanguage()}/banner`;
            try {
                banner = await BundleManager.getInstance().loadAsset<cc.Prefab>({
                    bundleId: id.toString(),
                    path: path,
                    type: cc.Asset
                });
            } catch (error) {
                cc.log(this.getErrorMessageBanner(id));
            }
        } else {
            cc.log(this.getErrorMessageBanner(id));
        }

        return banner;
    }

    public static async loadGameIcon(gameId: number, systemPath = ""): Promise<cc.Prefab> {
        const category = StorageManager.get("current_game_category") ?? 0;
        const gameConfiguration = getGameConfiguration(gameId);
        const gameSetting = LobbyManager.getInstance().getGame(gameId, category);

        let prefab: cc.Prefab;
        if (!!gameConfiguration?.remoteBundle) {
            const directory = systemPath === "" ? "icons" : `icons/${systemPath}`;
            const path = `${GameUtils.isMicroSite(gameConfiguration) ? gameId + "/" : ""}${directory}/${
                gameSetting?.bigSize ? "Big" : "Small"
            }`;
            prefab = await BundleManager.getInstance().loadAsset<cc.Prefab>({
                bundleId: gameId.toString(),
                path: path,
                type: cc.Prefab
            });
        } else {
            const directory = systemPath === "" ? "lobby/games" : `lobby/games/${systemPath}`;
            const path = `${directory}/${gameId}`;
            prefab = await GameUtils.loadResource(path);
        }

        uiManager.prefabCache.lobbyIcons[gameId] = prefab;
        return prefab;
    }

    public static async getStaticBanner(id: number, systemPath = "") {
        const gameConfiguration = getGameConfiguration(id);
        if (GameUtils.isMicroSite(gameConfiguration)) {
            return this.getRemoteBanner(id);
        }

        return this.getResourceBanner({
            id,
            remoteBundle: gameConfiguration.remoteBundle,
            systemPath
        });
    }

    protected static getErrorMessageBanner(id: number) {
        return `No banner for game ${id}`;
    }

    private static async preloadRemoteIcon(gameId: number) {
        try {
            const versions = await GameUtils.getRemoteVersion(gameId);
            const loadRemoteIconData = async (resource) => {
                const url = `${GameUtils.remoteGameResourceUrl(gameId, "icon")}/${resource}?v=${versions?.icon}`;
                const data: any = await GameUtils.loadRemote(url);
                return data;
            };

            const skeletonData = new sp.SkeletonData();
            skeletonData.skeletonJson = (await loadRemoteIconData("icon-game.json")).json;
            skeletonData.atlasText = (await loadRemoteIconData("icon-game.atlas")).text;
            skeletonData.textures = [await loadRemoteIconData("icon-game.png")];
            skeletonData["textureNames"] = [`icon-game.png`];

            uiManager.remoteIconCache[gameId] = { skeletonData: skeletonData, configFile: await loadRemoteIconData("config.json") };
        } catch (error) {
            console.log("preloadRemoteIcon error", error.message);
        }
    }

    private static async getSpineRemoteBanner(id: number) {
        const spineAssets = [];

        try {
            uiManager.remoteBannerCache[id]?.configFile ||
                (await GameUtils.loadRemoteGameResource<cc.JsonAsset>(id, `banner/en/config.json`));

            const host = GameUtils.remoteGameResourceUrl(id, `banner/${GameUtils.getCurrentLanguage()}`);
            const spineName = "banner-game";
            const resourceExts = ["atlas", "json", "png"];
            const versions = await GameUtils.getRemoteVersion(id);
            for (const ext of resourceExts) {
                try {
                    const resName = `${spineName}.${ext}?v=${versions?.banner}`;
                    const url = `${host}/${resName}`;
                    const asset = await GameUtils.loadRemote<cc.Asset>(url);
                    spineAssets.push(asset);
                } catch (error) {}
            }
        } catch (error) {
            cc.log(this.getErrorMessageBanner(id));
        }
        return spineAssets;
    }

    private static async getAnimationBanner(id: number, systemPath = "") {
        const gameConfiguration = getGameConfiguration(id);
        if (GameUtils.isMicroSite(gameConfiguration)) {
            return this.getSpineRemoteBanner(id);
        }

        return this.getBannerPrefab({
            id,
            remoteBundle: gameConfiguration.remoteBundle,
            systemPath
        });
    }

    public static getBannerTypeByGameId(id: number | string): string {
        const gameConfiguration = getGameConfiguration(id);
        return gameConfiguration?.bannerType;
    }

    private static createBannerNameOptions(id: number, isMicrosite: boolean): string[] {
        const currentLang = GameUtils.getCurrentLanguage();
        if (isMicrosite) {
            const name1 = `${currentLang}`;
            const defaultName = `en`;

            return [name1, defaultName];
        } else {
            const suffix = currentLang !== "vi" ? `_${currentLang}` : "";
            const name1 = `${id}${suffix}`;
            const name2 = `${id}`;

            return [name1, name2];
        }
    }

    private static async getRemoteBanner(gameId: number) {
        const bannerNames = this.createBannerNameOptions(gameId, true);
        let remoteTexture: cc.Texture2D;
        const versions = await GameUtils.getRemoteVersion(gameId);
        for (const bannerName of bannerNames) {
            try {
                remoteTexture = await GameUtils.loadRemoteGameResource<cc.Texture2D>(
                    gameId,
                    `banner/${bannerName}.png?v=${versions?.banner}`
                );
                if (remoteTexture) {
                    break;
                }
            } catch (error) {}
        }
        if (remoteTexture) {
            return new cc.SpriteFrame(remoteTexture);
        }
        cc.log(this.getErrorMessageBanner(gameId));
        return null;
    }

    private static bannerLoaded = false;
    public static gotoLobbyScene(onProgress, lobbyMenuConfig, splashConfig) {
        const onLoaded = async () => {
            try {
                const startLoadTime = Date.now();
                console.log(`SplashScreen - Start i&b: ${new Date(startLoadTime).toLocaleString()}`);
                await Promise.all([
                    this.preLoadBanner(lobbyMenuConfig),
                    this.preLoadGameIcons(lobbyMenuConfig, splashConfig),
                    this.preLoadBackgroundUI()
                ]);
                const endLoadTime = Date.now();
                console.log(
                    `SplashScreen - End i&b: ${new Date(endLoadTime).toLocaleString()}`,
                    `Total time: ${(endLoadTime - startLoadTime) / 1000}`
                );
            } catch (e) {
                console.log(e);
            }

            this.preloadDir();
        };

        cc.director.preloadScene("Lobby", onProgress, onLoaded);
    }

    private static preloadDir() {
        const themePath = LobbyResourceManager.isUseTheme() ? LobbyResourceManager.getThemePath() : "lobby/games";

        const iconPath = `${themePath}/prefabs/skeleton-icon`;

        cc.resources.loadDir(iconPath, () => {
            cc.director.loadScene("Lobby");
        });
    }

    private static preloadResource(path: any): Promise<any> {
        return new Promise((resolve) => cc.resources.load(path, resolve));
    }

    private static async preLoadGameIcons(lobbyMenuConfig, splashConfig) {
        try {
            const offerGames = userManager.offerGames ?? [];
            let firstCategoryGames = lobbyMenuConfig.firstCategoryList;
            let preLoadGameIds = [];

            // Filter offer games
            if (offerGames.length > 0 && firstCategoryGames?.length > 0) {
                firstCategoryGames = firstCategoryGames.filter((gameId) => offerGames.includes(gameId));
            }
            preLoadGameIds =
                firstCategoryGames?.length >= TotalPreloadGameIcon ? firstCategoryGames.slice(0, TotalPreloadGameIcon) : firstCategoryGames;

            if (LobbyResourceManager.isUseTheme()) {
                const preloadGameInMain = preLoadGameIds.filter(
                    (gameId) => getGameConfiguration(gameId) || lobbyMenuConfig.customGameIconBySystem.includes(gameId)
                );
                const preLoadGameAwaiters = preloadGameInMain.map((gameId) => LobbyResourceManager?.getInstance()?.loadGameIcon(gameId));
                await Promise.all([preLoadGameAwaiters]);

                console.log(`SplashScreen - Completed load game icons`, [
                    {
                        name: "main",
                        ids: preloadGameInMain.join(",")
                    }
                ]);

                return;
            }

            // Load game icon custom by system

            const preloadGameInMain = preLoadGameIds.filter((gameId) => !GameUtils.isMicroSite(getGameConfiguration(gameId)));
            const preLoadGameAwaiters = preloadGameInMain.map((gameId) => this.loadGameIcon(gameId));

            // Load game icon custom by system
            const preLoadGameBySystemIds = preLoadGameIds.filter((gameId) => lobbyMenuConfig.customGameIconBySystem.includes(gameId));
            const preLoadGameBySystemAwaiters = preLoadGameBySystemIds.map((gameId) => this.loadGameIcon(gameId, splashConfig.customPath));

            // Load game icon through remote site
            const preloadRemoteGameIds = preLoadGameIds.filter((id) => GameUtils.isMicroSite(getGameConfiguration(id)));
            const preloadRemoteGameAwaiters = preloadRemoteGameIds.map((gameId) => this.preloadRemoteIcon(gameId));

            // Wait all
            await Promise.all([...preLoadGameAwaiters, ...preLoadGameBySystemAwaiters, ...preloadRemoteGameAwaiters]);

            console.log(`SplashScreen - Completed load game icons`, [
                {
                    name: "main",
                    ids: preloadGameInMain.join(",")
                },
                {
                    name: "custom-by-system",
                    ids: preLoadGameBySystemIds.join(",")
                },
                {
                    name: "remote",
                    ids: preloadRemoteGameIds.join(",")
                }
            ]);
        } catch (ex) {
            console.log(ex);
        }
    }

    private static async preLoadBanner(lobbyMenuConfig) {
        try {
            if (this.bannerLoaded) {
                return;
            }

            const offerGames = userManager.offerGames ?? [];
            let bannerGameIds = lobbyMenuConfig.bannerAds ?? [];

            // Filter offer games if applicable
            if (offerGames.length > 0) {
                bannerGameIds = bannerGameIds.filter((gameId) => offerGames.includes(gameId));
            }

            if (bannerGameIds.length === 0) {
                return;
            }

            const bannerId = bannerGameIds[0];

            // Load themed banner if applicable
            if (LobbyResourceManager.isUseTheme() && bannerId > 0) {
                await this.loadThemedBanner(bannerId);
            } else {
                await this.loadStandardBanner(bannerId);
            }

            this.bannerLoaded = true;
        } catch (ex) {
            console.log(ex);
        }
    }

    private static async loadThemedBanner(bannerId: number) {
        const node = new cc.Node();
        const bannerComp = node.addComponent(SkeletonBannerTheme);

        await Promise.all([
            bannerComp.createRemoteIconNode(bannerId),
            this.preloadResource(`${LobbyResourceManager.getThemePath()}/prefabs/banner/bannerContainer`)
        ]);

        node.destroy();
    }

    private static getBannerSpriteFrame(gameId: number, imageName: string): Promise<cc.SpriteFrame> {
        return new Promise<cc.SpriteFrame>((resolve) => {
            cc.resources.load<cc.SpriteFrame>(`lobby/banner/textures/${gameId}/${imageName}`, cc.SpriteFrame, (err, spriteFrame) => {
                resolve(spriteFrame);
            });
        });
    }

    private static async getResourceBanner(data: { id: number; remoteBundle; systemPath: string }) {
        const { id, remoteBundle, systemPath } = data;
        let frame: cc.SpriteFrame;
        const bannerNames = this.createBannerNameOptions(id, false);
        for (const element of bannerNames) {
            if (!!remoteBundle && !MICRO_GAMES_NOT_OFFER_BANNER.includes(id)) {
                const path = systemPath === "" ? `banners/${element}` : `banners/${systemPath}/${element}}`;
                try {
                    frame = await BundleManager.getInstance().loadAsset<cc.SpriteFrame>({
                        bundleId: id.toString(),
                        path: path,
                        type: cc.SpriteFrame
                    });
                } catch (error) {
                    frame = await this.getBannerSpriteFrame(id, element);
                }
            } else {
                frame = await this.getBannerSpriteFrame(id, element);
            }

            if (frame) {
                break;
            }
        }

        return frame;
    }

    private static async loadStandardBanner(bannerId: number) {
        const bannerType = this.getBannerTypeByGameId(bannerId);
        const bannerLoader = bannerType === BannerType.Prefab ? this.getAnimationBanner(bannerId) : this.getStaticBanner(bannerId);

        await Promise.all([bannerLoader, this.preloadResource("lobby/banner/bannerContainer")]);
    }

    private static async preLoadBackgroundUI() {
        return this.preloadResource(`${LobbyResourceManager.getThemePath()}/prefabs/background-ui`);
    }
}
