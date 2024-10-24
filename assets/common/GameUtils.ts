import axios from "axios";
import { BundleManager } from "bundle-management";
import * as i18n from "i18n/runtime-scripts/LanguageData";

import { lodash } from "../ClientModules";
import * as SessionManager from "../common/auth/SessionManager";
import { GameConfiguration, getGameConfiguration, isGatewayGame, isUsingRemoteBundle } from "../configs/GameConfigurations";
import { TotalPreloadGameIcon } from "../constants";
import IGameBase from "../games/_base/IGameBase";
import LobbyManager from "../lobby/main/view-models/LobbyManager";
import LobbyResourceManager from "../lobby/main/view-models/LobbyResourceManager";
import SkeletonBannerTheme from "../lobby/main/view-models/theme/SkeletonBannerTheme";
import PromotionTournamentHandler from "../lobby/promotions/PromotionTournamentHandler";
import { appManager } from "../managers/AppManager";
import { uiManager } from "../managers/GameUIManager";
import { InternalEvents } from "../managers/InternalEvents";
import { StorageManager } from "../managers/StorageManager";
import MiniPanelInterface from "../mini-games-panel/view-models/MiniPanelInterface";
import SocketIOControllerInterface from "../SocketIOControllerInterface";
import { AXIOS_FAILED_PREFIX } from "../utils";
import AnimatedTime from "./animated-time/view-models/AnimatedTime";
import BetChipsInterface from "./bet-chips/view-models/BetChipsInterface";
import { ChipParams } from "./bet-chips/view-models/ChipFlyConfig";
import ChipStack from "./chip-stack/views/ChipStack";
import { numberWithCommas } from "./helpers/NumberHelper";
import { buildMicrositeGameUrl, buildSharedResourceUrl } from "./helpers/UrlHelper";
import { FormationHandler } from "./i18n/FormationHandler";
import Loading from "./loading/view-models/Loading";
import { sentryLogger } from "./logger";
import { preloadAssets } from "./PreloadRemoteAsset";
import SetStaticFontSizeLabel from "./SetStaticFontSizeLabel";
import { userManager } from "./user/UserManager";

export const MINI_GAMES_SCALE_ON_DESKTOP = 0.8;
export const MICRO_GAMES_NOT_OFFER_BANNER = [9, 48, 49, 50];
export enum BannerType {
    SingleImage = "singleImage",
    Prefab = "prefab"
}

declare global {
    interface Window {
        ReactNativeWebView: any;
    }
}

export default class GameUtils {
    static versionsCache = {};

    public static addFlyingText(parent: cc.Node, win: boolean, value: number, duration = 1, startY = 0, destY = 100) {
        const temp = new cc.Node().addComponent(cc.Label);
        temp.string = (win ? "+" : "-") + numberWithCommas(value, 2);
        temp.font = win ? appManager.font.increaseMoney : appManager.font.decreaseMoney;
        temp.lineHeight = 130;
        temp.fontSize = 30;
        temp.node.position = cc.v3(0, startY, 0);
        parent.addChild(temp.node);
        temp.node.runAction(
            cc.sequence(
                cc.moveTo(duration, cc.v2(0, startY + destY)),
                cc.callFunc(function () {
                    this.node.destroy();
                }, temp)
            )
        );
        return temp.node;
    }

    public static getText(key: string, opt: any = {}) {
        return i18n.t(key, opt);
    }

    public static getBetChoiceString(choice: string): string {
        return i18n.t(`ui.choice_${choice}`);
    }

    public static capitalizeWords(str: string) {
        return str.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.slice(0, 1).toLowerCase();
        });
    }

    public static capitalizeWordIntoString(str: string) {
        const words = str.split(" ");
        return words.map((word) => word[0] + word.substring(1).toLowerCase()).join(" ");
    }

    public static remoteGameResourceUrl(gameId: number, pathResource: string) {
        const url = buildMicrositeGameUrl(gameId);
        return `${url}/remote/${pathResource}`;
    }

    public static loadRemoteGameResource<T>(gameId: number, pathResource: string) {
        return this.loadRemote<T>(this.remoteGameResourceUrl(gameId, pathResource));
    }

    public static loadRemoteFromSharedResource<T>(pathResource: string) {
        const url = buildSharedResourceUrl(pathResource);
        return this.loadRemote<T>(url);
    }

    public static loadRemote<T>(url: string): Promise<T> {
        return new Promise((resolve, reject) => {
            cc.assetManager.loadRemote(url, (err, asset: T) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(asset);
            });
        });
    }

    public static loadResource(path: string): Promise<cc.Prefab> {
        return new Promise((resolve) => {
            cc.resources.load(path, (err, prefab: cc.Prefab) => {
                resolve(prefab);
            });
        });
    }

    public static async getRemoteVersion(gameId: number) {
        if (!this.versionsCache[gameId]) {
            const versions: any = await GameUtils.loadRemote(`${GameUtils.remoteGameResourceUrl(gameId, "versions.json")}?v=${Date.now()}`);
            this.versionsCache[gameId] = versions?.json;
        }
        return this.versionsCache[gameId];
    }

    public static cachedGameIcon(gameId: number) {
        const gameConfiguration = getGameConfiguration(gameId);
        const isMicrosite = GameUtils.isMicroSite(gameConfiguration);
        return !!isMicrosite ? uiManager.remoteIconCache[gameId] : uiManager.prefabCache.lobbyIcons[gameId];
    }

    public static async preloadRemoteIcon(gameId: number) {
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
            prefab = await this.loadResource(path);
        }

        uiManager.prefabCache.lobbyIcons[gameId] = prefab;
        return prefab;
    }

    public static async loadMiniPanelGameIcon(gameId: number): Promise<cc.Prefab> {
        const gameConfiguration = getGameConfiguration(gameId);

        if (!!gameConfiguration?.remoteBundle) {
            const path = `icons/SmallMiniPanel`;
            const devPath = `../games/*/${path}`;
            try {
                return await BundleManager.getInstance().loadAsset<cc.Prefab>({
                    bundleId: gameId.toString(),
                    path: path,
                    pathForDevMode: devPath,
                    type: cc.Prefab
                });
            } catch (e) {
                cc.warn(`Missing prefab for ${path} `, e);
                return null;
            }
        } else {
            return GameUtils.loadResource(`minipanel/games/${gameId}`);
        }
    }

    public static async loadMiniGamePrefab(gameId: number, onProgress: (completed: number, total: number, item?: unknown) => void) {
        const gameConfiguration = getGameConfiguration(gameId);

        if (!!gameConfiguration?.remoteBundle) {
            const prefabPath = `views/${gameConfiguration.key}`;

            return BundleManager.getInstance().loadAsset<cc.Prefab>({
                bundleId: gameId.toString(),
                path: prefabPath,
                type: cc.Prefab,
                onProgress
            });
        } else {
            const prefabPath = `games/minigame/${gameConfiguration.key}`;

            return new Promise<cc.Prefab>((resolve, reject) => {
                cc.resources.load<cc.Prefab>(prefabPath, cc.Prefab, onProgress, (error, prefab) => {
                    if (error || !prefab) {
                        reject(error);
                    } else {
                        resolve(prefab);
                    }
                });
            });
        }
    }

    public static async asyncExecute<T>(node: cc.Node, promiseValue: Promise<T>): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const errorMessage = "Node is not valid!.";
            if (!node?.isValid) {
                reject(new Error(errorMessage));
            } else {
                promiseValue
                    .then((result) => {
                        if (!node?.isValid) {
                            reject(new Error(errorMessage));
                        } else {
                            resolve(result);
                        }
                    })
                    .catch((err) => {
                        cc.warn("----asyncExecute----:", err);
                    });
            }
        });
    }

    public static async asyncExecuteAbortSignal<T>(node: cc.Node, promiseValue: Promise<T>, abortSignal: AbortSignal): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const errorMessage = "Node is not valid!";
            if (!node?.isValid || abortSignal.aborted) {
                return reject(new Error(errorMessage));
            }

            // Listen for the abort signal to reject the promise if canceled
            abortSignal.addEventListener("abort", () => {
                cc.warn("Operation cancelled");
                reject(new Error(errorMessage));
            });

            promiseValue
                .then((result) => {
                    if (!node?.isValid || abortSignal.aborted) {
                        reject(new Error(errorMessage));
                    } else {
                        resolve(result);
                    }
                })
                .catch((err) => {
                    cc.warn("----asyncExecute----:", err);
                });
        });
    }

    public static getChipValues(bet: number, options: number[]): any {
        const chipValue = this.calcChipValue(options, bet);
        return chipValue.values;
    }

    public static getChipQuantity(bet: number, options: number[]): any {
        const list = [...options].reverse();
        const chipValue = this.calcChipValue(list, bet);
        const values = chipValue.values;

        if (chipValue.chipTotal > 0) {
            values[0] = 1;
        }
        return values;
    }

    private static calcChipValue(list, total) {
        const values = {};
        let chipTotal = total;
        list.forEach((value) => {
            const count = Math.floor(chipTotal / value);
            values[value] = count;
            chipTotal = chipTotal % value;
        });

        return { values, chipTotal };
    }

    static setStorageGame(key, gameId, data) {
        StorageManager.set(`${key}_${gameId}`, data);
    }

    static getStorageGame(key, gameId) {
        return StorageManager.get(`${key}_${gameId}`) ?? {};
    }

    static clearGameSetting(gameId) {
        StorageManager.remove(`UserSetting_game_${gameId}`);
    }

    /**
     * Normal Game Setting will CLEAR when enter game by user click
     * @param gameId
     * @param data
     */
    static setGameSetting(gameId, data) {
        this.setStorageGame(`UserSetting_game`, gameId, data);
    }

    static setSubGameSetting(gameId, key, subData) {
        const data = this.getSpecificGameSetting(gameId);
        data[key] = subData;
        this.setSpecificGameSetting(gameId, data);
    }

    static getSubGameSetting(gameId, key) {
        const data = this.getSpecificGameSetting(gameId);
        return data[key];
    }

    static getGameSetting(gameId) {
        return this.getStorageGame("UserSetting_game", gameId);
    }

    /**
     * Specific Game Setting will NOT CLEAR when enter game by user click
     * @param gameId
     * @param data
     */
    static setSpecificGameSetting(gameId, data) {
        this.setStorageGame("SpecificGame", gameId, data);
    }

    static getSpecificGameSetting(gameId) {
        return this.getStorageGame("SpecificGame", gameId);
    }

    public static async openGameDirect(gameId: number, socketIOController: SocketIOControllerInterface) {
        const gameConfiguration = getGameConfiguration(gameId);
        if (GameUtils.isMicroSite(gameConfiguration)) {
            this.openGameMicrosite(gameId);
            return;
        }
        await this.tryOpenGameDirect(gameId, socketIOController);
        await this.loadSceneGame(gameId, socketIOController);
    }

    public static async tryOpenGameDirect(gameId: number, socketIOController: SocketIOControllerInterface) {
        try {
            await socketIOController.openGameSocket(gameId);
            await this.preloadGameRoom(gameId);
        } catch (error) {
            cc.error("An error occurred in tryOpenGameDirect:", error);
            throw error;
        }
    }

    public static async openGameMicrosite(gameId: number, loading: Loading = null) {
        try {
            const available = await this.healthCheckMicrositeGame(gameId);
            if (available) {
                SessionManager.storeMicrositeGameId(gameId);
                const sceneName = "microsite-game";
                await this.loadScene(gameId, sceneName);
            } else {
                loading?.setLoadingVisibility(false);
                const data = {
                    text: i18n.t("messages.lostGameConnection", { gameName: await this.getDisplayGameName(gameId) }),
                    isInfo: false
                };
                uiManager.emitter.emit(InternalEvents.LOST_CONNECTION, data);
            }
        } catch (error) {
            cc.error("An error occurred in openGameMicrosite:", error);
        }
    }

    public static async healthCheckMicrositeGame(gameId: number) {
        const url = `${buildMicrositeGameUrl(gameId)}/health`;
        try {
            const response = await axios.get(url);
            if (response.data?.toString().trim() === "healthy") {
                return true;
            } else {
                sentryLogger.log(JSON.stringify(response));
                return false;
            }
        } catch (error) {
            sentryLogger.log(`${AXIOS_FAILED_PREFIX} healthcheck: ${url}`);
            return false;
        }
    }

    public static async loadSceneGame(gameId, socketIOController: SocketIOControllerInterface) {
        const sceneName = socketIOController.gameScene[gameId];
        await this.loadScene(gameId, sceneName);
    }

    public static async loadScene(gameId, sceneName: string) {
        await new Promise<void>((resolve) => {
            cc.director.preloadScene(
                sceneName,
                (progress, total) => {
                    uiManager.emitter.emit(InternalEvents.LOADING_GAME, { gameId, progress, total });
                    uiManager.emitter.emit(`${InternalEvents.LOADING_GAME}-${gameId}`, { progress, total });
                },
                (error) => {
                    if (error) {
                        this.onForceReload();
                    } else {
                        cc.director.loadScene(sceneName, () => {
                            PromotionTournamentHandler.getInstance().checkTournamentPromotionsBeforeSignIn();
                            resolve();
                        });
                    }
                }
            );
        });
    }

    private static onForceReload(showNotice = true, message = i18n.t("messages.newUpdateAvailable")) {
        const forceReload = () => {
            location.reload();
        };

        if (showNotice) {
            const data = {
                text: message,
                isInfo: true
            };

            uiManager.emitter.emit(InternalEvents.NOTICE, {
                data,
                onConfirm: null,
                onClose: forceReload
            });
        } else {
            forceReload();
        }
    }

    public static preloadGameRoom(gameId) {
        return new Promise((resolve) => {
            const language = window.i18n.curLang;
            if (isUsingRemoteBundle(gameId)) {
                const path = `i18n/images/${language}`;
                const preloadPath = `preload`;
                BundleManager.getInstance()
                    .loadBundle(`${gameId}`)
                    .then((bundle: cc.AssetManager.Bundle) => {
                        bundle.loadDir(preloadPath, () => {
                            bundle.loadDir(path, cc.SpriteFrame, resolve);
                        });
                    })
                    .catch(resolve);
            } else {
                cc.resources.loadDir(`image/${language}/${gameId}`, cc.SpriteFrame, null, resolve);
            }
        });
    }

    static openSocketGatewayGame(gameId: number, socketIOController: SocketIOControllerInterface, onConnected?: () => void) {
        const socket = socketIOController.createGatewayGameSocket(gameId);
        const onConnectSocketFailed = async () => {
            const gameName = await GameUtils.getDisplayGameName(gameId);
            uiManager.emitter.emit(InternalEvents.MINI_PANEL_GAME_CONNECT_FAILED, gameName, gameId);
        };
        const onConnectCallback = async () => {
            await GameUtils.openGatewayGameScene(gameId);
            onConnected && onConnected();
        };
        socketIOController.initBaseListenersForSocketUrl(socket, gameId, onConnectSocketFailed, onConnectCallback);
        socket.on("message", (data) => {
            if (data.um) {
                socketIOController.closeSocket(gameId);
                if (data.um_message) {
                    uiManager.emitter.emit(InternalEvents.MINI_PANEL_GAME_UM, data.um_message, gameId);
                }
            }
        });
        socket.on("forceDisconnect", () => {
            socket.disconnect();
        });
    }

    static async openGatewayGameScene(gameId: number) {
        try {
            const available = true;
            if (available) {
                const sceneName = `gateway-${gameId}`;
                await BundleManager.getInstance().loadBundle(`${gameId}`);
                await this.loadScene(gameId, sceneName);
            } else {
                const data = {
                    text: i18n.t("messages.lostGameConnection", { gameName: await this.getDisplayGameName(gameId) }),
                    isInfo: false
                };
                uiManager.emitter.emit(InternalEvents.LOST_CONNECTION, data);
            }
        } catch (error) {
            cc.error("An error occurred in openGameMicrosite:", error);
        }
    }

    public static async openGame(
        gameId: number,
        miniPanel: MiniPanelInterface,
        onOpenMiniGame = () => {
            // handle
        },
        fromMainLobby = false
    ) {
        uiManager.isPauseLoadingIcons = true;
        uiManager.setCurrentGameId(gameId);
        const loading = miniPanel?.getGameLoadingComp(gameId);
        loading?.setDefaultPercent();

        const gameConfiguration = getGameConfiguration(gameId);
        const mainId = gameConfiguration.gateway?.id;
        if (fromMainLobby && isGatewayGame(gameId) && mainId === gameId) {
            this.openSocketGatewayGame(mainId, miniPanel?.socketIOController);
            return;
        }
        if (GameUtils.isMicroSite(gameConfiguration)) {
            this.openGameMicrosite(gameId, loading);
            return;
        }

        await this.preloadGameAssets(gameConfiguration, miniPanel, gameId);

        if (!gameConfiguration.mini && gameId > 0) {
            StorageManager.remove(`orientation`);
            uiManager.emitter.emit(InternalEvents.MINI_PANEL_OPEN_TABLE_GAME, null, gameId);
            return;
        }

        onOpenMiniGame?.();
        uiManager.emitter.emit(InternalEvents.MINI_PANEL_OPEN_MINI_GAME, null, gameId);
    }

    private static async preloadGameAssets(gameConfiguration: GameConfiguration, miniPanel: MiniPanelInterface, gameId: number) {
        try {
            if (!!gameConfiguration.remoteBundle) {
                await BundleManager.getInstance().loadBundle(gameId.toString());
                await preloadAssets(gameId.toString());
            }
        } catch (error) {
            cc.error("An error occurred in preloadGameAssets:", error);
            miniPanel?.unCacheAndHideGameLoading(miniPanel?.getGameLoadingComp(gameId), gameId);
        }
    }

    public static roundFixed(num: number, fixedNumber: number): number {
        const numToFixedDp = Number(num).toFixed(fixedNumber);
        return Number(numToFixedDp);
    }

    public static moveToOtherNode(node: cc.Node, destNode: cc.Node) {
        const position = destNode.convertToNodeSpaceAR(node.convertToWorldSpaceAR(cc.v3(0, 0, 0)));
        node.parent = destNode;
        node.position = position;
    }

    public static floatToNumber2(opt: {
        label: cc.Label;
        amount: number;
        start?: number;
        prefixStr?: string;
        formatNumber?: (value) => string;
        stepValue?: number;
        stepTime?: number;
    }) {
        return new Promise<void>((resolve) => {
            const { label, amount: end, start } = opt;
            const prefixStr = opt.prefixStr ?? "";
            const defaultFormater = (v) => numberWithCommas(v, 2, false);
            const formatNumber = opt.formatNumber ?? defaultFormater;
            const stepValue = opt.stepValue ?? 0.01;
            const stepTime = opt.stepTime ?? 0.02;
            const startStr = label.string.replace(prefixStr, "");
            const startValue = start || parseFloat(startStr.replace(/,/g, "")) || 0;
            const range = Math.abs(end - startValue);
            if (!range) {
                resolve();
                return;
            }

            const repeatCount = Math.floor(range / stepValue);

            let value = startValue;
            label.node.stopAllActions();
            const formatText = (value) => prefixStr + formatNumber(value);
            cc.tween(label.node)
                .repeat(
                    repeatCount,
                    cc
                        .tween(label.node)
                        .call(() => {
                            label.string = formatText(value);
                            value += stepValue;
                        })
                        .delay(stepTime)
                )
                .call(() => {
                    label.string = formatText(end);
                    resolve();
                })
                .start();
        });
    }

    public static floatToNumber(opt: {
        label: cc.Label;
        amount: number;
        duration: number;
        start?: number;
        noZeroSuffix?: boolean;
        prefixStr?: string;
    }) {
        const { label, amount: end, start, duration } = opt;
        const noZeroSuffix = opt.noZeroSuffix ?? true;
        const prefixStr = opt.prefixStr ?? "";
        const startStr = label.string.replace(prefixStr, "");
        const startValue = start || parseFloat(startStr.replace(/,/g, "")) || 0;
        const range = Math.abs(end - startValue);
        if (!range) {
            return;
        }

        let stepTime, repeatCount, stepValue;
        if (duration !== undefined) {
            stepTime = Math.max(duration / range, 0.05);
            repeatCount = Math.floor(duration / stepTime);
            stepValue = +(range / repeatCount).toFixed(2);
        } else {
            stepValue = 0.01;
            stepTime = 0.1;
            repeatCount = Math.floor(range / stepValue);
        }

        let value = startValue;
        label.node.stopAllActions();
        cc.tween(label.node)
            .repeat(
                repeatCount,
                cc
                    .tween(label.node)
                    .call(() => {
                        label.string = prefixStr + numberWithCommas(value, 2, noZeroSuffix);
                        value += stepValue;
                    })
                    .delay(stepTime)
            )
            .call(() => {
                label.string = prefixStr + numberWithCommas(end, 2, noZeroSuffix);
            })
            .start();
    }

    public static getAvatarSprite(avatarId: number): Promise<cc.SpriteFrame> {
        return new Promise((resolve) => {
            const name = avatarId ? avatarId : 1;
            cc.resources.load<cc.SpriteFrame>(`avatars/${name}`, cc.SpriteFrame, (err, frame) => {
                if (frame) {
                    resolve(frame);
                }
            });
        });
    }

    public static getGameNameString(gameId): string {
        if (!gameId) {
            return "";
        }
        return i18n.t(`gameNames.${gameId}`);
    }

    static remoteLocalization = {};

    public static async loadRemoteLocalization(gameId: number) {
        if (!this.remoteLocalization[gameId]) {
            const versions = await GameUtils.getRemoteVersion(gameId);
            const localizationVersion = versions?.localization ?? 1;
            const localization = await this.loadRemoteGameResource<cc.JsonAsset>(gameId, `localization.json?v=${localizationVersion}`);
            this.remoteLocalization[gameId] = localization.json;
        }
    }

    public static async getRemoteDisplayGameName(gameId, breakline = false) {
        try {
            await this.loadRemoteLocalization(gameId);
            const list = ["generalGameNames", "gameNames"];
            breakline && list.unshift("lobbyNames");

            const currentLanguage = this.getCurrentLanguage();
            const key = list.find((key) => this.getRemoteTranslation(gameId, key, currentLanguage));
            if (!key) {
                this.getRemoteTranslation(gameId, "gameNames", "en");
            }
            return this.getRemoteTranslation(gameId, key, currentLanguage);
        } catch (error) {
            cc.error("An error occurred in getRemoteDisplayGameName:", error);
            return "";
        }
    }

    private static getRemoteTranslation(gameId: number, key: string, language: string) {
        return this.remoteLocalization[gameId]?.[key]?.[language];
    }

    public static async getDisplayGameName(gameId, breakline = false): Promise<string> {
        const gameConfiguration = getGameConfiguration(gameId);
        if (GameUtils.isMicroSite(gameConfiguration)) {
            return this.getRemoteDisplayGameName(gameId, breakline);
        }
        const lobbyGameNameKey = `lobbyNames.${+gameId}`;
        const generalGameNameKey = `generalGameNames.${+gameId}`;
        const gameNameKey = `gameNames.${+gameId}`;
        const list = [generalGameNameKey, gameNameKey];
        if (breakline) {
            list.unshift(lobbyGameNameKey);
        }
        const findNameKey = () => list.find((key) => key !== i18n.t(key));

        let key = findNameKey();
        if (key === undefined) {
            await BundleManager.getInstance().loadBundle(gameId.toString());
        }
        key = findNameKey();

        return key ? i18n.t(key) : key;
    }

    public static getValueByCurrency(value: number, otherRate?: number): number {
        if (!otherRate) {
            otherRate = 1;
        }

        return (value * otherRate) / userManager.rate;
    }

    public static getTicketValueByCurrency(value: number, userRate?: number, otherRate?: number): number {
        if (!otherRate) {
            otherRate = 1;
        }

        if (!userRate) {
            userRate = userManager.rate;
        }
        return (value * otherRate) / userRate;
    }

    public static getValueByExchangeRateCode(value: number, exchangeRateCode) {
        let currencyRate = exchangeRateCode[userManager.currencyCode];
        if (!currencyRate) {
            currencyRate = 1;
        }
        return value / (userManager.multiplier * currencyRate);
    }

    public static getFilterValuesByStakeLevel(values: number[], gameConfigs: any): number[] {
        let minBet = gameConfigs.minBet;
        let maxBet = gameConfigs.maxBet;

        const userStakeLevel = userManager.stakeLevel;
        minBet = Math.max(userStakeLevel.minBet, minBet);
        maxBet = Math.min(userStakeLevel.maxBet, maxBet);
        return values.map((a) => +a).filter((value) => value >= minBet && value <= maxBet);
    }

    public static async copyToClipboard(data: string, hintLabel: cc.Label, callback): Promise<void> {
        const showResult = (message: string) => {
            hintLabel.string = message;
            if (callback) {
                callback();
            }
        };

        const copySuccessfully = await this.copyText(data);
        const keyResult = copySuccessfully ? "messages.copy_success" : "messages.copyMD5Failed";
        showResult(i18n.t(keyResult));
    }

    public static async copyText(text: string) {
        try {
            if (this.isAndroidWebView()) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ eventType: "copy_to_clipboard", data: text }));
            } else {
                await navigator.clipboard.writeText(text);
            }
            return true;
        } catch (e) {
            cc.log(e);
            return false;
        }
    }

    public static isIpad(): boolean {
        const userAgent = window.navigator.userAgent.toLowerCase();
        return /ipad/.test(userAgent);
    }

    public static isAndroidWebView(): boolean {
        return (cc.sys.os === cc.sys.OS_LINUX || cc.sys.os === cc.sys.OS_ANDROID) && window.ReactNativeWebView;
    }

    public static isAndroid(): boolean {
        return cc.sys.os === cc.sys.OS_ANDROID;
    }

    public static isPhone(): boolean {
        const userAgent = window.navigator.userAgent.toLowerCase();
        return /android|iphone/i.test(userAgent);
    }

    public static isSafariIOSPhone(): boolean {
        return cc.sys.os === cc.sys.OS_IOS && !window.navigator.userAgent.match(/CriOS/i);
    }

    public static createNodeFromPrefab(prefab: cc.Prefab) {
        return cc.instantiate(prefab);
    }

    /** 
    DEPRECATED, should use AnimationUtils.delayTime
    */
    public static delayTime(time: number) {
        return new Promise<void>((resolve) => {
            cc.tween({})
                .delay(time)
                .call(() => resolve())
                .start();
        });
    }

    public static waitUntil = async (condition, interval = 1000, maxWait = 10000) => {
        const startTime = new Date().getTime();
        for (;;) {
            try {
                if (await condition()) {
                    return true;
                }
            } catch (e) {
                cc.error("Error occurred while evaluating condition:", e);
                throw e;
            }

            if (new Date().getTime() - startTime > maxWait) {
                throw new Error("Max wait reached");
            } else {
                await new Promise((resolve) => setTimeout(resolve, interval));
            }
        }
    };
    public static showNode(node: cc.Node, transitionTime = 0.3) {
        node.active = true;
        node.opacity = 0;
        cc.tween(node).to(transitionTime, { opacity: 255 }).start();
    }

    public static hideNode2(node: cc.Node, options: any) {
        const duration = options.duration ?? 0.3;
        const onHidden = options.onHidden;
        this.hideNode(node, duration, onHidden);
    }

    public static hideNode(node: cc.Node, transitionTime = 0.3, onHidden?: () => void) {
        cc.tween(node)
            .to(transitionTime, { opacity: 0 })
            .call(() => {
                onHidden && onHidden();
            })
            .start();
    }

    public static unCacheAndHideGameLoading(gameId: number) {
        const loading = uiManager.getLoadingWithGameID(gameId);
        if (loading) {
            loading.setLoadingVisibility(false);
            uiManager.unCacheIconLoading(gameId);
        }
    }

    public static getCurrentLanguage() {
        return window.i18n.curLang;
    }

    private static async getRemoteBanner(gameId: number) {
        const bannerNames = this.createBannerNameOptions(gameId, true);
        let remoteTexture: cc.Texture2D;
        const versions = await GameUtils.getRemoteVersion(gameId);
        for (const bannerName of bannerNames) {
            try {
                remoteTexture = await this.loadRemoteGameResource<cc.Texture2D>(gameId, `banner/${bannerName}.png?v=${versions?.banner}`);
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

    private static createBannerNameOptions(id: number, isMicrosite: boolean): string[] {
        const currentLang = this.getCurrentLanguage();
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

    public static async getAnimationBanner(id: number, systemPath = "") {
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

    public static async getSpineRemoteBanner(id: number) {
        const spineAssets = [];

        try {
            uiManager.remoteBannerCache[id]?.configFile ||
                (await GameUtils.loadRemoteGameResource<cc.JsonAsset>(id, `banner/en/config.json`));

            const host = GameUtils.remoteGameResourceUrl(id, `banner/${this.getCurrentLanguage()}`);
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

    public static async getBannerPrefab(data: { id: number; remoteBundle; systemPath: string }) {
        const { id, remoteBundle, systemPath } = data;
        let banner: cc.Prefab;

        if (!!remoteBundle && !MICRO_GAMES_NOT_OFFER_BANNER.includes(id)) {
            const path =
                systemPath === ""
                    ? `banners/${this.getCurrentLanguage()}/banner`
                    : `banners/${systemPath}/${this.getCurrentLanguage()}/banner`;
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
    protected static getErrorMessageBanner(id: number) {
        return `No banner for game ${id}`;
    }

    public static getBannerTypeByGameId(id: number | string): string {
        const gameConfiguration = getGameConfiguration(id);
        return gameConfiguration?.bannerType;
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

    public static getBannerSpriteFrame(gameId: number, imageName: string): Promise<cc.SpriteFrame> {
        return new Promise<cc.SpriteFrame>((resolve) => {
            cc.resources.load<cc.SpriteFrame>(`lobby/banner/textures/${gameId}/${imageName}`, cc.SpriteFrame, (err, spriteFrame) => {
                resolve(spriteFrame);
            });
        });
    }

    public static isMiniGame(gameId: string | number): boolean {
        const gameConfiguration = getGameConfiguration(gameId);
        return +gameId !== 0 && !!gameConfiguration?.mini;
    }

    public static calculateWinPercentage(originalChoices: string[], roundHistory: any) {
        const count = this.calculateWin(originalChoices, roundHistory);

        const choices = [...originalChoices].sort((a, b) => count[a] - count[b]);

        let total = 0;
        const percentage = {};
        choices.forEach((choice, index) => {
            const value = Math.floor((count[choice] * 100) / roundHistory.length);
            percentage[choice] = `${value}`;
            if (index === choices.length - 1) {
                percentage[choice] = `${100 - total}`;
            }

            total += value;
        });

        return percentage;
    }

    public static calculateWin(originalChoices: string[], roundHistory: any) {
        return roundHistory.reduce((count: any, history) => {
            originalChoices.forEach((choice) => {
                count[choice] = count[choice] ?? 0;
                if (history.settlementResult[choice]) {
                    count[choice] = count[choice] + 1;
                }
            });
            return count;
        }, {});
    }

    public static checkIntersectNodes(container: cc.Node, child: cc.Node) {
        const box = container.getBoundingBox();
        const pos = container.convertToWorldSpaceAR(cc.v2(0, 0));
        const srcBox = cc.rect(pos.x - box.width / 2, pos.y - box.height / 2, box.width, box.height);
        const destBox = child.getBoundingBoxToWorld();
        return srcBox.intersects(destBox);
    }

    public static createChipStack(
        bet: number,
        betChips: BetChipsInterface,
        option: { isChip3D: boolean; shadowFrame: cc.SpriteFrame; skewX: number }
    ) {
        const values = this.getChipQuantity(bet, betChips.chipValues);
        const node = new cc.Node();
        const shadow = new cc.Node();
        shadow.scaleX = 0.52;
        shadow.scaleY = 0.47;
        shadow.opacity = 175;
        shadow.addComponent(cc.Sprite).spriteFrame = option.shadowFrame;
        node.addChild(shadow);
        let chipStack;

        if (!option.isChip3D) {
            chipStack = node.addComponent(ChipStack);
            chipStack.chipSize = 26;
            chipStack.thickness = 10;
            chipStack.skewX = option.skewX;
        }

        const keys = Object.keys(values).sort((a, b) => +b - +a);
        let firstChip = true;
        keys.forEach((chip) => {
            const count = values[chip];
            for (let i = 0; i < count; i++) {
                let chipNode: cc.Node;
                if (+chip === 0) {
                    chipNode = betChips.createLowValueChip();
                } else {
                    chipNode = option.isChip3D ? betChips.createChipFly(+chip) : betChips.createBigChip(+chip);
                }

                if (!option.isChip3D) {
                    chipStack.addChip(chipNode);
                    const chipConfig = GameUtils.addShadowFrameStack(firstChip, option.shadowFrame, chipNode, i);
                    firstChip = chipConfig.isFirstChip;
                    chipNode = chipConfig.chip;
                } else {
                    chipNode.position = cc.v3(lodash.random(-2, 2), node.childrenCount * (ChipParams.offset + ChipParams.offsetStack), 0);
                    node.addChild(chipNode);
                }
            }
        });
        return node;
    }

    private static addShadowFrameStack(firstChip: boolean, shadowFrame: cc.SpriteFrame, chipNode: cc.Node, index: number) {
        if (firstChip && index === 0) {
            firstChip = false;
            const shadow = new cc.Node();
            shadow.addComponent(cc.Sprite).spriteFrame = shadowFrame;
            chipNode.addChild(shadow);
        }
        return { chip: chipNode, isFirstChip: firstChip };
    }

    public static isChipStack(bet: number, betChips: BetChipsInterface, destNode: cc.Node) {
        const currNodeAmount = destNode.childrenCount;
        const values = this.getChipQuantity(bet, betChips.chipValues);
        const keys = Object.keys(values).sort((a, b) => +b - +a);

        let totalChip = 0;
        keys.forEach((chip) => {
            totalChip += values[chip];
        });
        return { isStack: totalChip < currNodeAmount, chipValues: values, chipTotal: totalChip };
    }

    public static setFontSizeLabelsInNode(node: cc.Node, isCustom = false, fontSize = 36) {
        let parentNode;
        node.getComponentsInChildren(cc.Label).forEach((label) => {
            const labelNode = label.node;
            if (!labelNode.getComponent(SetStaticFontSizeLabel)) {
                labelNode.scale = 0.535;
                label.fontSize = fontSize;
                label.lineHeight = fontSize + 4;
            }

            if (isCustom) {
                labelNode.color = cc.Color.BLACK.fromHEX("#ffe800");
                const labelFormat = labelNode.getComponent("LocalizedLabelWithFormat");
                if (labelFormat) {
                    labelFormat.format = FormationHandler.TITLE;
                    labelFormat.updateLabel();
                } else {
                    console.warn("Label doesnt has LocalizedLabelWithFormat: ", labelNode.name);
                }
            }
            if (parentNode !== labelNode.parent) {
                parentNode = labelNode.parent;
                const layout = parentNode.getComponent(cc.Layout);
                layout && (layout.affectedByScale = true);
            }
        });
    }

    public static updateSpineDuration(spine: sp.Skeleton, animationName: string, duration: number) {
        const original = spine.findAnimation(`${animationName}`).duration;
        spine.timeScale = original / duration;
    }

    public static setColorAndOpacity(color: string, node: cc.Node) {
        node.color = cc.Color.WHITE.fromHEX(color);
        node.opacity = cc.Color.WHITE.fromHEX(color).getA();
    }

    public static setCanvasVisibilty(active: boolean) {
        const gameContainer = document.getElementById("Cocos2dGameContainer");
        const canvas = gameContainer.childNodes.item(0) as any;
        canvas.style.visibility = active ? "visible" : "hidden";
    }

    public static readonly isMicroSite = (gameConfiguration: GameConfiguration) => {
        return !!gameConfiguration?.isMicrosite && !gameConfiguration?.mini;
    };

    public static getTruthyRoundId = (main: IGameBase, data) => {
        return data?.remainingTime > main.config.betTime ? data.roundId - 1 : data.roundId;
    };

    public static loadResourceAsset<T>(path: string, assetType: typeof cc.Asset): Promise<T> {
        return new Promise<T>((resolve) => {
            cc.resources.load(path, assetType, (err, asset) => {
                resolve(asset as T);
            });
        });
    }

    public static async loadAssetsFromBundle<AssetType extends cc.Asset>(
        bundleName: string,
        assetPath: string,
        assetType: any,
        onProgress: ((finished: number, total: number) => void) | null
    ) {
        try {
            const bundle = await BundleManager.getInstance().loadBundle(bundleName);
            if (bundle) {
                return new Promise<AssetType>((resolve) => {
                    bundle.load(assetPath, assetType, onProgress, (err, asset) => {
                        if (err) {
                            cc.log(`Cannot load asset ${assetPath} from bundle ${bundleName}`);
                            resolve(null);
                        } else {
                            resolve(asset as AssetType);
                        }
                    });
                });
            }

            return null;
        } catch (error) {
            cc.log(`Error loading assets from bundle: ${error}`);
            return null;
        }
    }

    public static getAudioKeyForLanguage(name: string): string {
        const language = window.i18n.curLang;
        return `${name}_${language || "en"}`;
    }

    public static initSlotCountDownTimer(timer: AnimatedTime, duration: number, hideTimer: () => void) {
        if (!timer || !timer.node || !hideTimer) {
            return;
        }

        timer.setAnimatedY(5, 0);

        let count = 0;
        return cc
            .tween(timer.node)
            .repeat(
                duration,
                cc
                    .tween()
                    .call(() => {
                        timer.setTime(`${duration - count}`);
                        count++;
                    })
                    .delay(1)
            )
            .call(() => {
                hideTimer();
            })
            .start();
    }
    private static bannerLoaded = false;
    private static gameIconPreloaded = false;
    public static gotoLobbyScene(onProgress, lobbyMenuConfig, splashConfig) {
        const onLoaded = async () => {
            try {
                const startLoadTime = Date.now();
                console.log(`SplashScreen - Start i&b: ${new Date(startLoadTime).toLocaleString()}`);
                await Promise.all([this.preLoadBanner(lobbyMenuConfig), this.preLoadGameIcons(lobbyMenuConfig, splashConfig)]);
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
            const preLoadGameAwaiters = preloadGameInMain.map((gameId) => GameUtils.loadGameIcon(gameId));

            // Load game icon custom by system
            const preLoadGameBySystemIds = preLoadGameIds.filter((gameId) => lobbyMenuConfig.customGameIconBySystem.includes(gameId));
            const preLoadGameBySystemAwaiters = preLoadGameBySystemIds.map((gameId) =>
                GameUtils.loadGameIcon(gameId, splashConfig.customPath)
            );

            // Load game icon through remote site
            const preloadRemoteGameIds = preLoadGameIds.filter((id) => GameUtils.isMicroSite(getGameConfiguration(id)));
            const preloadRemoteGameAwaiters = preloadRemoteGameIds.map((gameId) => GameUtils.preloadRemoteIcon(gameId));

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

            // Filter offer games
            if (offerGames.length > 0) {
                bannerGameIds = bannerGameIds.filter((gameId) => offerGames.includes(gameId));
            }

            if (bannerGameIds.length == 0) {
                return;
            }

            const bannerId = bannerGameIds[0];

            if (LobbyResourceManager.isUseTheme() && bannerId > 0) {
                const node = new cc.Node();
                const bannerComp = node.addComponent(SkeletonBannerTheme);

                // Load banner and container concurrently
                await Promise.all([
                    bannerComp.createRemoteIconNode(bannerId),
                    new Promise((resolve) =>
                        cc.resources.load(`${LobbyResourceManager.getThemePath()}/prefabs/banner/bannerContainer`, resolve)
                    )
                ]);

                // Cleanup and set banner loaded flag
                node.destroy();
                this.bannerLoaded = true;

                return;
            }

            let bannerAwaiters: Promise<unknown>;
            const bannerType = GameUtils.getBannerTypeByGameId(bannerId);
            if (bannerType === BannerType.Prefab) {
                bannerAwaiters = GameUtils.getAnimationBanner(bannerId);
            } else {
                bannerAwaiters = GameUtils.getStaticBanner(bannerId);
            }

            const bannerContainerAwaiters = new Promise((resolve) => {
                cc.resources.load("lobby/banner/bannerContainer", resolve);
            });

            await Promise.all([bannerAwaiters, bannerContainerAwaiters]);
            this.bannerLoaded = true;
        } catch (ex) {
            console.log(ex);
        }
    }
}
