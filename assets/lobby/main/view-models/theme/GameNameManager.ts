import { IInfoShareResource } from "../LobbyResourceManager";

export class GameNameManager {
    constructor(private infoShareResource: IInfoShareResource) {}

    public getIgnoreCapitalizeGameNames() {
        return this.infoShareResource.ignoreCapitalizeGameNames;
    }

    public getGameNameBreakLine(gameId: number, lang: string) {
        return this.infoShareResource.gameNamesBreakLine?.[gameId]?.[lang];
    }

    public getGameNamesFontSize(gameId: number, lang: string) {
        return this.infoShareResource.gameNamesFontSize?.[gameId]?.[lang];
    }
}
