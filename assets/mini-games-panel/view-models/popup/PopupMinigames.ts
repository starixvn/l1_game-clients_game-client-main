import { lazyInject } from "../../../Application";
import AudioManager from "../../../common/audio/AudioManager";
import GameUtils from "../../../common/GameUtils";
import { userManager } from "../../../common/user/UserManager";
import LobbyMenuConfig from "../../../lobby/main/view-models/LobbyMenuConfig";
import { appManager } from "../../../managers/AppManager";
import { uiManager } from "../../../managers/GameUIManager";
import { InternalEvents } from "../../../managers/InternalEvents";
import JackpotWinner from "../JackpotWinner";
import { roundTimerManager } from "../RoundTimerManager";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupMinigames extends cc.Component {
    @property(cc.Node)
    list: cc.Node = null;
    @property(cc.Node)
    panel: cc.Node = null;
    @property(cc.Node)
    menuIcon: cc.Node = null;

    @property(cc.Node)
    jackPotContainer: cc.Node = null;

    @property(cc.Node)
    roundTimer: cc.Node = null;

    @lazyInject(LobbyMenuConfig)
    private readonly lobbyMenuConfig: LobbyMenuConfig;

    private ttOffset = cc.v2(0, 0);
    private ttOffset2 = cc.v2(0, 0);
    private toggleRuning = false;
    public background: cc.Node = null;
    private prevPosition;
    private jackpotWinner: JackpotWinner = null;

    private hideMiniGames = false;

    onLoad() {
        if (this.getMiniGamesList().length === 0) {
            this.hideMiniGames = true;
        }
        this.panel.active = !this.hideMiniGames;

        if (appManager.popupMiniGamesLastPosition) {
            this.node.position = appManager.popupMiniGamesLastPosition;
        }

        this.prevPosition = this.node.position;
        this.setMiniGamesIconVisibility(false);

        roundTimerManager.initEvents();
        this.initDefaultGameRoundTimer();
        this.initJackpotEvents();

        cc.game.on(cc.game.EVENT_SHOW, this.onGameShow, this);
    }

    getMiniGamesList() {
        const list = this.lobbyMenuConfig.miniList;
        return list.filter((i) => i === 0 || userManager.offerGames.some((j) => j === i));
    }

    async initDefaultGameRoundTimer() {
        const prefab = await GameUtils.asyncExecute<cc.Prefab>(
            this.node,
            GameUtils.loadMiniPanelGameIcon(this.lobbyMenuConfig.roundTimerGame.main)
        );
        if (prefab) {
            const node = cc.instantiate(prefab);
            this.roundTimer?.addChild(node);
            node.getChildByName("icon-game").active = false;
        }
        roundTimerManager.requestRoundTimer();
    }

    initJackpotEvents() {
        uiManager.emitterListener(InternalEvents.RECEIVED_JACKPOT_WINNER, (data) => this.showJackpotWinner(data), this);
    }

    onDestroy() {
        this.unschedule(this.moveToEdge);
        roundTimerManager.removeEvents();
        cc.game.off(cc.game.EVENT_SHOW, this.onGameShow, this);
        uiManager.removeListenersWithTarget(this);
    }

    onGameShow() {
        roundTimerManager.requestRoundTimer();
    }

    onEnable() {
        if (this.hideMiniGames) {
            return;
        }

        this.panel.on(cc.Node.EventType.TOUCH_START, this.eventStart, this);
        this.panel.on(cc.Node.EventType.TOUCH_MOVE, this.eventMove, this);
        this.panel.on(cc.Node.EventType.TOUCH_END, this.eventEnd, this);
        this.panel.on(cc.Node.EventType.TOUCH_CANCEL, this.eventEnd, this);
        this.panel.on(cc.Node.EventType.MOUSE_ENTER, this.setTop, this);
    }
    onDisable() {
        this.panel.off(cc.Node.EventType.TOUCH_START, this.eventStart, this);
        this.panel.off(cc.Node.EventType.TOUCH_MOVE, this.eventMove, this);
        this.panel.off(cc.Node.EventType.TOUCH_END, this.eventEnd, this);
        this.panel.off(cc.Node.EventType.TOUCH_CANCEL, this.eventEnd, this);
        this.panel.off(cc.Node.EventType.MOUSE_ENTER, this.setTop, this);
    }
    eventStart(e) {
        this.setTop();
        this.ttOffset = cc.v2(e.touch.getLocationX() - this.node.position.x, e.touch.getLocationY() - this.node.position.y);
        this.ttOffset2 = cc.v2(
            e.touch.getLocationX() - (e.touch.getLocationX() - this.node.position.x),
            e.touch.getLocationY() - (e.touch.getLocationY() - this.node.position.y)
        );
    }
    eventMove(e) {
        this.node.position = cc.v3(e.touch.getLocationX() - this.ttOffset.x, e.touch.getLocationY() - this.ttOffset.y, 0);
        this.callMoveToEdge();
    }

    callMoveToEdge() {
        this.unschedule(this.moveToEdge);
        this.scheduleOnce(this.moveToEdge, 0.2);
    }

    getCurrentSize() {
        let listBox = this.list.getBoundingBox();

        if (!this.list.active && this.jackPotContainer.active) {
            listBox = this.jackPotContainer.getBoundingBox();
        }

        return cc.v2(Math.max(this.node.width, listBox.width), Math.max(this.node.height, listBox.height));
    }

    moveToEdge() {
        const width = this.node.parent.width;
        const height = this.node.parent.height;
        const fixTopPadding = 100;
        const size = this.getCurrentSize();
        const maxX = width / 2 - size.x / 2;
        const maxY = height / 2 - size.y / 2;
        const deltaWidth = maxX - Math.abs(this.node.x);
        const deltaHeight = maxY - Math.abs(this.node.y);

        let posX, posY;
        if (deltaWidth < deltaHeight) {
            posY = this.node.y;
            posY = Math.min(maxY, posY);
            posY = Math.max(-maxY, posY);
            posX = this.node.x < 0 ? -maxX : maxX;
        } else {
            posX = this.node.x;
            posX = Math.min(maxX, posX);
            posX = Math.max(-maxX, posX);
            posY = this.node.y < 0 ? -maxY : maxY;
        }

        posY = Math.min(maxY - fixTopPadding, posY);

        cc.tween(this.node).to(0.1, { x: posX, y: posY }, { easing: "sineOut" }).start();
        appManager.popupMiniGamesLastPosition = cc.v3(posX, posY);
    }

    eventEnd(e) {
        this.moveToEdge();
        const xChanger = this.ttOffset2.x - (e.touch.getLocationX() - this.ttOffset.x);
        const yChanger = this.ttOffset2.y - (e.touch.getLocationY() - this.ttOffset.y);
        if (xChanger < 5 && xChanger > -5 && yChanger < 5 && yChanger > -5) {
            this.toggle();
        } else {
            this.callMoveToEdge();
        }
    }

    toggle() {
        AudioManager.getInstance().playClick();
        const widgetComp = this.node.getComponent(cc.Widget);
        widgetComp.isAlignRight = false;

        if (!this.toggleRuning) {
            this.toggleRuning = true;
            const menuAnimation = this.menuIcon.getComponent(cc.Animation);

            if (this.list.scale !== 0) {
                this.hideListGame();
                menuAnimation.play();
            } else {
                this.showListGame();
                menuAnimation.stop();
                this.menuIcon.getChildByName("icon").angle = 0;
            }
        }
    }

    showListGame() {
        this.prevPosition = this.node.position;
        this.background.active = true;
        cc.tween(this.background).to(0.1, { opacity: 224 }).start();

        cc.tween(this.node)
            .to(0.2, { scale: 0, opacity: 0 }, { easing: "sineOut" })
            .call(() => {
                this.setMiniGamesIconVisibility(true);
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

    setMiniGamesIconVisibility(visible: boolean) {
        this.list.active = visible && !this.hideMiniGames;
        this.list.scale = visible ? 1 : 0;
    }

    async createJackpotWinnerNode() {
        const jackpotPrefab = await GameUtils.loadResource("minipanel/popup-mini-game/jackpot-winner-anoucement");
        try {
            const jackpot = cc.instantiate(jackpotPrefab);
            const jackpotWinner = jackpot.getComponent(JackpotWinner);
            this.jackpotWinner = jackpotWinner;
            this.jackPotContainer?.addChild(jackpot);
            this.jackPotContainer.active = false;
        } catch (error) {
            cc.warn("Failed to init jackpot - " + error);
        }
    }

    async showJackpotWinner(data: any) {
        if (this.isNotifyJackpotWinner(data)) {
            if (!this.jackpotWinner) {
                await this.createJackpotWinnerNode();
            }
            if (this.jackpotWinner) {
                this.jackPotContainer.width = this.jackpotWinner.node.width;
                this.jackPotContainer.height = this.jackpotWinner.node.height;
                this.jackpotWinner.setData(data);
                this.menuIcon.active = false;
                this.jackPotContainer.active = true;

                cc.tween(this)
                    .delay(6)
                    .call(() => {
                        this.jackPotContainer.active = false;
                        this.menuIcon.active = true;
                    })
                    .start();
            }
        }
    }

    isNotifyJackpotWinner(data: any) {
        return userManager.userName !== data.winnerName && !userManager.disableJackpotGames;
    }

    hideListGame() {
        cc.tween(this.node)
            .to(0.2, { scale: 0, opacity: 0, position: this.prevPosition }, { easing: "sineIn" })
            .call(() => {
                this.background.active = false;
                this.toggleRuning = false;
                this.setMiniGamesIconVisibility(false);
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

    setTop() {
        this.node.parent.insertChild(this.node, this.node.parent.childrenCount - 1);
    }
}
