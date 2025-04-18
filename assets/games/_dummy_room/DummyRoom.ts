import AudioManager from "../../common/audio/AudioManager";
import MusicPlayer from "../../common/audio/MusicPlayer";
import * as SessionManager from "../../common/auth/SessionManager";
import BaseComponent from "../../common/BaseComponent";
import GameUtils from "../../common/GameUtils";
import InGameMenu, { InGameMenuEvents } from "../../common/in-game-menu/InGameMenu";
import UserProfile from "../../common/user-profile/UserProfile";
import { appManager } from "../../managers/AppManager";
import MiniPanel from "../../mini-games-panel/view-models/MiniPanel";
import { loadUserData } from "../_base/action/GameRoomActions";
const { ccclass, property } = cc._decorator;

@ccclass
export default class DummyRoom extends BaseComponent {
    @property(cc.Sprite)
    background: cc.Sprite = null;

    @property(UserProfile)
    userProfile: UserProfile = null;

    @property(MiniPanel)
    currentMiniPanel: MiniPanel = null;

    @property
    backgroundCount = 3;

    onLoad() {
        this.initEventForInGameMenu();
        this.loadRandomBackground();
        appManager.currentScene = this;
        const dummyRoomStorage = SessionManager.getDummyRoomStorage();
        const gameId = dummyRoomStorage.gameId;
        GameUtils.openGame(gameId, this.currentMiniPanel);

        MusicPlayer.getInstance().init();
    }

    initEventForInGameMenu() {
        const inGameMenu = cc.director.getScene().getComponentInChildren(InGameMenu);
        if (inGameMenu) {
            const node = inGameMenu.node;
            node.on(InGameMenuEvents.GO_TO_LOBBY, this.goToLobbyScene, this);
        }
    }

    loadRandomBackground() {
        const randomBg = Math.ceil(Math.random() * this.backgroundCount);
        const spriteName = `dummy-room/background/bg-${randomBg}`;
        cc.resources.load<cc.SpriteFrame>(spriteName, cc.SpriteFrame, (err, frame) => {
            if (err) {
                cc.log("Can not load ", spriteName);
                return;
            }
            try {
                this.background.spriteFrame = frame;
            } catch (e) {
                cc.log("Can not set background ", spriteName);
            }
        });
    }

    private goToLobbyScene() {
        this.outRoomGame();
    }

    loadUserData(user) {
        loadUserData(this)(user);
    }

    outRoomGame() {
        appManager.redirectToLobby();
    }

    onCloseGame() {
        this.outRoomGame();
    }

    onCloseGameClick() {
        AudioManager.getInstance().playClick();
        this.onCloseGame();
    }
}
