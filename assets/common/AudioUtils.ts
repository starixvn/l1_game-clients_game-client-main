import GameUtils from "./GameUtils";

interface AudioInfo {
    bundle: string;
    path: string;
}

export type TAudioValue = {
    bundle: string;
    path: string;
    type: string;
    isMusicGame?: boolean;
    isLazyLoad?: boolean;
};

export type TAudioConfigs = {
    [key: string]: TAudioValue;
};

export default class AudioUtils {
    public static readonly getAudioInfo = (audioValue: TAudioValue, key: string): AudioInfo => {
        const bundle = audioValue?.bundle;
        const path = audioValue?.path ? `${audioValue?.path}/${key}` : `shared/sounds/${key}`;
        return { bundle, path };
    };

    public static readonly getAudioClip = async (bundle: string, path: string): Promise<cc.AudioClip | null> => {
        try {
            const loadedClip = await GameUtils.loadAssetsFromBundle(bundle, path, cc.AudioClip, null);
            return loadedClip as cc.AudioClip;
        } catch (error) {
            console.error(`Failed to load audio clip from bundle: ${error}`);
            return null;
        }
    };
}
