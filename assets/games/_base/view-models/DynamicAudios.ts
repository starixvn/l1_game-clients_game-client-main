import { TAudioConfigs, TAudioValue } from "../../../common/AudioInterface";
import AudioUtils from "../../../common/AudioUtils";
import AudioManager from "../../../common/audio/AudioManager";
import GameAudios from "./GameAudios";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DynamicAudios extends GameAudios {
    @property(cc.AudioSource)
    sfxSource: cc.AudioSource = null;

    @property(cc.JsonAsset)
    sharedAudioConfig: cc.JsonAsset = null;

    protected audioIds = [];

    playAudio(clip: cc.AudioClip) {
        const audioId = AudioManager?.getInstance()?.playSFX(clip);
        this.audioIds.push(audioId);
    }

    stopAllAudio() {
        this.audioIds.forEach((id) => {
            AudioManager?.getInstance()?.stopSFX(id);
        });
        this.audioIds = [];
    }

    public loadAudios(gameAudioConfig: cc.JsonAsset) {
        const audioConfigs: TAudioConfigs = {
            ...this.sharedAudioConfig?.json,
            ...gameAudioConfig?.json
        };

        AudioManager?.audioConfigs(audioConfigs);
    }

    public async playSFXAudio(id: string) {
        const audioClip = await this.getAudioClip(id);
        if (audioClip) {
            const sourceClip = this.getSourceClip(this?.sfxSource, audioClip);
            this.playAudio(sourceClip?.clip);
        }
    }

    protected getSourceClip(audioSource: cc.AudioSource, audioClip: cc.AudioClip) {
        if (audioSource) {
            audioSource.clip = audioClip;
            return audioSource;
        }

        return null;
    }

    protected async getAudioClip(id: string) {
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

    protected loadAssets = async (audioValue: TAudioValue, soundId: string): Promise<{ audioClip: cc.AudioClip | null }> => {
        const { bundle, path } = AudioUtils.getAudioInfo(audioValue, soundId);

        if (!path) {
            return { audioClip: null };
        }

        const audioClip = await AudioUtils.getAudioClip(bundle, path);

        return { audioClip };
    };

    public preloadAudioConfigs() {
        const audioConfigs = AudioManager?.audioConfigs() || {};
        for (const [audioKey, value] of Object.entries(audioConfigs)) {
            if (value?.isLazyLoad !== true) {
                const { bundle, path } = AudioUtils.getAudioInfo(value, audioKey);
                AudioUtils.getAudioClip(bundle, path);
            }
        }
    }
}
