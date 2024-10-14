import LobbyResourceManager from "../../../lobby/main/view-models/LobbyResourceManager";
import { uiManager } from "../../../managers/GameUIManager";
import { InternalEvents } from "../../../managers/InternalEvents";
import { roundTimerManager } from "../RoundTimerManager";
import PopupMinigames from "./PopupMinigames";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupMiniGamesTheme extends PopupMinigames {
    @property(cc.Node)
    highlightIcon: cc.Node = null;

    onLoad(): void {
        this.handleHighlightIcon(true);
        super.onLoad();
    }

    async initDefaultGameRoundTimer() {
        const mainGameId = this.lobbyMenuConfig.roundTimerGame?.main;
        const prefab = await LobbyResourceManager?.getInstance()?.loadPrefabResource(`mini-game/counters/${mainGameId}`);

        if (prefab) {
            const node = cc.instantiate(prefab);
            this.roundTimer?.addChild(node);
        }

        roundTimerManager.requestRoundTimer();
    }

    showListGame() {
        this.prevPosition = this.node.position;
        this.background.active = true;
        cc.tween(this.background).to(0.1, { opacity: 224 }).start();
        this.handleHighlightIcon(false);
        this.list.scale = 1;

        cc.tween(this.node)
            .to(0.2, { scale: 0, opacity: 0 }, { easing: "sineOut" })
            .call(() => {
                this.list.active = true;
                cc.tween(this.menuIcon).to(0.2, { scale: 0.8 }, { easing: "sineOut" }).start();
            })
            .to(0.3, { scale: 1, opacity: 255, position: cc.v3(0, 0, 0) }, { easing: "sineIn" })
            .call(() => {
                this.toggleRuning = false;
                this.roundTimer.active = false;
                roundTimerManager.requestRoundTimer();
                uiManager.emitter.emit(InternalEvents.SHOW_POPUP_MINI_GAMES);
            })
            .start();
    }

    hideListGame() {
        cc.tween(this.node)
            .to(0.2, { scale: 0, opacity: 0, position: this.prevPosition }, { easing: "sineIn" })
            .call(() => {
                this.background.active = false;
                this.toggleRuning = false;
                this.list.active = false;
                this.list.scale = 0;
                this.handleHighlightIcon(true);
            })
            .to(0.2, { scale: 1, opacity: 255 }, { easing: "sineOut" })
            .call(() => {
                cc.tween(this.menuIcon).to(0.2, { scale: 0.9 }, { easing: "sineOut" }).start();
                uiManager.emitter.emit(InternalEvents.HIDE_POPUP_MINI_GAMES);
                this.roundTimer.active = true;
                roundTimerManager.requestRoundTimer();
            })
            .start();
    }

    handleHighlightIcon(status: boolean) {
        this.highlightIcon && (this.highlightIcon.active = status);
    }
}
