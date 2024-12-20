import { uiManager } from "../../../../managers/GameUIManager";
import LobbyResourceManager from "../LobbyResourceManager";

export interface IGameIconLoader {
    loadGameIcon(gameId: number): Promise<cc.SpriteFrame>;
    loadMiniGameIcon(gameId: number): Promise<cc.SpriteFrame>;
}

export class GameIconLoader implements IGameIconLoader {
    constructor(private lobbyResource: LobbyResourceManager) {}

    public async loadGameIcon(gameId: number): Promise<cc.SpriteFrame> {
        return this.loadIcon(gameId, "game", uiManager.spriteFrameCache.lobbyIcons);
    }

    public async loadMiniGameIcon(gameId: number): Promise<cc.SpriteFrame> {
        return this.loadIcon(gameId, "mini-game", uiManager.spriteFrameCache.miniPanelIcons);
    }

    private async loadIcon(gameId: number, type: "game" | "mini-game", cache: any): Promise<cc.SpriteFrame> {
        const version = this.lobbyResource.infoShareResource[type === "game" ? "versionGameIcon" : "versionMiniGameIcon"];
        const resourcePath = `${type}-icons/${gameId}/en.webp?v=${version}`;
        const remoteTexture = await this.lobbyResource?.resourceLoader?.loadRemoteSharedResource<cc.Texture2D>(resourcePath);
        const spriteFrame = new cc.SpriteFrame(remoteTexture);
        cache[gameId] = { spriteFrame };

        if (spriteFrame) {
            return spriteFrame;
        }

        cc.log(`Not get ${type === "game" ? "Game" : "Mini Game"} Icon from shared resource: ${gameId}`);
        return null;
    }
}
