import AudioUtils, { TAudioConfigs, TAudioValue } from "../../../common/AudioUtils";
import AudioManager from "../../../common/audio/AudioManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameAudios extends cc.Component {
    @property(cc.AudioSource)
    startGame: cc.AudioSource = null;

    @property(cc.AudioSource)
    endGame: cc.AudioSource = null;

    @property(cc.AudioSource)
    clockTick: cc.AudioSource = null;

    @property(cc.AudioSource)
    showResult: cc.AudioSource = null;

    @property(cc.AudioSource)
    sfxSource: cc.AudioSource = null;

    @property(cc.JsonAsset)
    sharedAudioConfig: cc.JsonAsset = null;

    @property(cc.JsonAsset)
    audioConfig: cc.JsonAsset = null;

    playStartGameAudio() {
        AudioManager.getInstance().playSFX(this.startGame.clip);
    }

    playEndGameAudio() {
        AudioManager.getInstance().playSFX(this.endGame.clip);
    }

    playClockTickAudio() {
        AudioManager.getInstance().playSFX(this.clockTick.clip);
    }

    playShowResultAudio() {
        AudioManager.getInstance().playSFX(this.showResult.clip);
    }

    stopAllAudio() {
        // handle
    }

    async loadAudios() {
        const audioConfigs: TAudioConfigs = {
            ...this.sharedAudioConfig?.json,
            ...this.audioConfig?.json
        };

        AudioManager.audioConfigs(audioConfigs);
    }

    async playSFXAudio(id: string) {
        const audioClip = await this.getAudioClip(id);
        if (audioClip) {
            const sourceClip = this.getSourceClip(this.sfxSource, audioClip);
            AudioManager.getInstance().playSFX(sourceClip.clip);
        }
    }

    protected getSourceClip(audioSource: cc.AudioSource, audioClip: cc.AudioClip) {
        audioSource.clip = audioClip;
        return audioSource;
    }

    async getAudioClip(id: string) {
        const audioValue = AudioManager?.audioConfigs()?.[id];
        if (!audioValue) {
            return;
        }

        const { audioClip } = await this.loadAssets(audioValue, id);

        if (audioClip) {
            return audioClip;
        }
        return null;
    }

    loadAssets = async (audioValue: TAudioValue, soundId: string): Promise<{ audioClip: cc.AudioClip | null }> => {
        const { bundle, path } = AudioUtils.getAudioInfo(audioValue, soundId);

        if (!bundle || !path) {
            return { audioClip: null };
        }

        const audioClip = await AudioUtils.getAudioClip(bundle, path);

        return { audioClip };
    };
}
