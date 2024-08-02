import { SystemType } from "../../ISystem";
import { sentryLogger } from "../logger";
import AudioManager from "./AudioManager";
import NameSongManager from "./NameSongManager";

export default class MusicPlayer {
    private nameSongManager: NameSongManager;
    public isPlayBgMusic = false;
    public isJoinRoomMusic = false;
    public initialized = false;
    protected bgMusicId: number;
    readonly volumeDefault = 0.7;
    readonly musicChangedKey = "lobby";
    protected intervalVolDecrease: NodeJS.Timeout;
    protected intervalVolIncrease: NodeJS.Timeout;
    protected volume = 0.5;
    readonly stepVolume = 0.05;
    readonly duration = 3.5;
    readonly stepIntervalVolume = (this.duration * 1000) / (this.volume / this.stepVolume);
    private static instanceMusic: MusicPlayer;
    private lastLoadSongTask: { promise: Promise<cc.AudioClip>; cancel: () => void };

    public static getInstance(): MusicPlayer {
        if (!this.instanceMusic) {
            this.instanceMusic = new MusicPlayer();
            this.instanceMusic.nameSongManager = new NameSongManager({
                [SystemType.SC1]: ["SC1/song1", "SC1/song2", "SC1/song3", "SC1/song4", "SC1/song5", "SC1/song6", "SC1/song7"]
            });
        }

        return this.instanceMusic;
    }

    private get audioManager() {
        return AudioManager.getInstance();
    }

    stopBackgroundAudio() {
        this.isPlayBgMusic = false;
        this.audioManager.stopMusic();
        this.bgMusicId && cc.audioEngine.stop(this.bgMusicId);
        this.bgMusicId = -1;
    }

    private getRandomNameSong() {
        return this.nameSongManager.getSongName();
    }

    private playBgAudio(play: boolean) {
        this.clearIntervalSetVolume();
        this.isJoinRoomMusic && this.audioManager.removeMusicChanged(this.musicChangedKey);

        if (play && !this.isJoinRoomMusic) {
            this.loadResourceAudio(this.getRandomNameSong());
            this.isPlayBgMusic = true;
        } else {
            this.stopBackgroundAudio();
        }
    }

    private loadAudio(song: string) {
        let reject;
        const promise = new Promise<cc.AudioClip>((resolve, rejectInPromise) => {
            reject = rejectInPromise;
            cc.resources.load(`music/${song}`, cc.AudioClip, (err, audioClip: cc.AudioClip) => {
                audioClip?.addRef();
                resolve(audioClip);
            });
        });

        return {
            promise,
            cancel: () => {
                reject && reject(new Error(`${sentryLogger.ignoreErrorsPrefix} cancel load audio`));
            }
        };
    }

    private async loadResourceAudio(song: string) {
        try {
            if (this.lastLoadSongTask) {
                this.lastLoadSongTask.cancel();
            }
            this.lastLoadSongTask = this.loadAudio(song);

            const audioClip = await this.lastLoadSongTask.promise;
            if (this.isPlayBgMusic) {
                await AudioManager.getInstance().awaitForReady();
                if (!this.isPlayBgMusic) {
                    return;
                }
                if (AudioManager.getInstance().musicEnabled) {
                    this.playAudioClip(audioClip);
                }
            }
        } catch (err) {
            cc.warn(err.message);
        }
    }

    playAudioClip(audioClip: cc.AudioClip) {
        this.bgMusicId && cc.audioEngine.stop(this.bgMusicId);
        this.bgMusicId = this.audioManager.playMusic(audioClip, false);
        cc.audioEngine.setVolume(this.bgMusicId, this.volumeDefault);
        cc.audioEngine.setFinishCallback(this.bgMusicId, () => {
            this.stopBackgroundAudio();
            this.playBgAudio(true);
        });
    }

    init() {
        this.initialized = true;
        this.isJoinRoomMusic = false;
        if (!this.isPlayBgMusic) {
            this.playBgAudio(this.audioManager.musicEnabled);
        }
        this.audioManager.addMusicChanged(this.musicChangedKey, (enable: boolean) => {
            this.playBgAudio(enable);
        });
    }

    decreaseVolumeAndStopBackgroundMusic() {
        return new Promise<void>((resolve) => {
            this.clearIntervalSetVolume();
            if (this.isPlayBgMusic) {
                this.volume = this.volumeDefault;
                const func = () => this.handleDecreaseVolume(resolve);

                func();
                this.intervalVolDecrease = setInterval(() => {
                    func();
                }, this.stepIntervalVolume);
            } else {
                resolve();
            }
        });
    }

    private handleDecreaseVolume(onComplete: () => void) {
        cc.audioEngine.setVolume(this.bgMusicId, this.volume);
        this.volume -= this.stepVolume;
        if (this.volume <= 0) {
            clearInterval(this.intervalVolDecrease);
            this.stopBackgroundAudio();
            onComplete();
        }
    }

    private clearIntervalSetVolume() {
        this.intervalVolDecrease && clearInterval(this.intervalVolDecrease);
        this.intervalVolIncrease && clearInterval(this.intervalVolIncrease);
    }

    handleIncreaseVolume() {
        this.clearIntervalSetVolume();
        if (this.bgMusicId > -1) {
            this.intervalVolIncrease = setInterval(() => {
                cc.audioEngine.setVolume(this.bgMusicId, this.volume);
                this.volume += this.stepVolume;
                this.volume >= 0.7 && clearInterval(this.intervalVolIncrease);
            }, this.stepIntervalVolume);
        }
    }
}
