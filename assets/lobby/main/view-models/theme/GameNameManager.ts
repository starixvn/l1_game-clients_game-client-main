import { lobbyResourceManager } from "../LobbyResourceManager";

export interface IGameNamesFontSize {
    [gameId: string]: {
        [languageCode: string]: number;
    };
}

export interface IGameNamesBreakLine {
    [gameId: string]: {
        [languageCode: string]: string;
    };
}

export class ThemeGameNameManager {
    private static _instance: ThemeGameNameManager;

    public static getInstance(): ThemeGameNameManager {
        if (!this._instance) {
            this._instance = new ThemeGameNameManager();
        }

        return this._instance;
    }

    public getIgnoreCapitalizeGameNames() {
        return lobbyResourceManager?.infoShareResource?.ignoreCapitalizeGameNames;
    }

    public getGameNameBreakLine(gameId: number, lang: string) {
        return lobbyResourceManager?.infoShareResource?.gameNamesBreakLine?.[gameId]?.[lang];
    }

    public getGameNamesFontSize(gameId: number, lang: string) {
        return lobbyResourceManager?.infoShareResource?.gameNamesFontSize?.[gameId]?.[lang];
    }
}

export const themeGameNameManager = ThemeGameNameManager.getInstance();
