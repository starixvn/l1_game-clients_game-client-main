import AudioManager from "../../common/audio/AudioManager";
import MusicPlayer from "../../common/audio/MusicPlayer";
import * as SessionManager from "../../common/auth/SessionManager";
import BaseComponent from "../../common/BaseComponent";
import GameUtils from "../../common/GameUtils";
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
        this.loadRandomBackground();
        appManager.currentScene = this;
        const dummyRoomStorage = SessionManager.getDummyRoomStorage();
        const gameId = dummyRoomStorage.gameId;
        GameUtils.openGame(gameId, this.currentMiniPanel);

        MusicPlayer.getInstance().init();
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

    loadUserData(user) {
        loadUserData(this)(user);
    }

    outRoomGame() {}

    onCloseGame() {
        this.outRoomGame();
    }

    onCloseGameClick() {
        AudioManager.getInstance().playClick();
        this.onCloseGame();
    }
}
