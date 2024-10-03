import { appManager } from "../../../../managers/AppManager";
import { uiManager } from "../../../../managers/GameUIManager";
import { UrlInfo } from "../../../../managers/UrlInfo";
import LobbyResourceManager from "../LobbyResourceManager";
import CircleMenu from "./../CircleMenu";

const { ccclass } = cc._decorator;

@ccclass
export default class CircleMenuTheme extends CircleMenu {
    async loadGameIcon(gameId: number, node: cc.Node) {
        if (gameId === 0) {
            return;
        }

        try {
            const cachedSprite = uiManager.spriteFrameCache.miniPanelIcons[gameId]?.spriteFrame;
            const spriteFrame = cachedSprite || (await LobbyResourceManager.loadMiniGameIcon(gameId));
            if (spriteFrame) {
                const newNode = new cc.Node();
                newNode.name = `mini-game-${gameId}`;
                newNode.addComponent(cc.Sprite).spriteFrame = spriteFrame;

                node?.addChild(newNode);
                node.children[0].active = false;
            }
        } catch (e) {
            console.warn(e);
        }
    }

    addItem(id: number, prefab: cc.Prefab): cc.Node {
        if (!prefab || (id === 0 && appManager.isDirectMode && !appManager.urlInfo[UrlInfo.ReturnUrl])) {
            return null;
        }
        const node = cc.instantiate(prefab);
        node.scale = 0.95;
        this.content?.addChild(node);
        this.updateGameName(id, node);
        this.loadGameIcon(id, node);

        const hoverScale = node.getComponent("hoverScale");
        if (hoverScale) {
            hoverScale.pressedScale = 1;
        }
        return node;
    }

    onInitialized() {
        const count = this.content.childrenCount;
        const radius = this.content.width * 0.3;
        const degree = 360 / count;
        this.content.children.forEach((child, index) => {
            const angle = degree * index;
            child.position = cc.v3(radius * Math.sin(cc.misc.degreesToRadians(angle)), radius * Math.cos(cc.misc.degreesToRadians(angle)));
        });
    }
}
