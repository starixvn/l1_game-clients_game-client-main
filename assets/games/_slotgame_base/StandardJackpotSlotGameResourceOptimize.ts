import { BundleManager } from "bundle-management";
import GameUtils from "../../common/GameUtils";
import { ClassicSlotSound } from "./ClassicSlotSound";
import StandardJackpotSlotGame from "./StandardJackpotSlotGame";

const { ccclass } = cc._decorator;

@ccclass
export default class StandardJackpotSlotGameResourceOptimize extends StandardJackpotSlotGame {
    protected getPrefabsList(): Record<string, string> {
        return {
            // prefab name : prefab property
            "effect-transition": "effectTransitionPrefab",

            // "effect-bonus": "effectBonus",
            // "effect-big-win": "effectBigWin",
            // "effect-freespin": "effectFreeSpin",

            // "dialog-bonus": "bonusDialog",

            "line-normal": "linePrefab",
            "line-glow": "lightLinePrefab",

            "preview-symbol-left": "previewSymbolLeft",
            "preview-symbol-right": "previewSymbolRight"
        };
    }

    start() {
        this.loadDelayedAudios();
        this.loadDelayedPrefabsByCode();
    }

    async loadDelayedPrefabsByCode() {
        const dict = this.getDelayedPrefabsList();

        for (const key of Object.keys(dict)) {
            console.log("start loadDelayedPrefabWithBundle", key);
            await GameUtils.asyncExecute(this?.node, this.loadDelayedPrefabWithBundle(key, dict[key]));
            console.log("end loadDelayedPrefabWithBundle", key);
        }
    }

    async loadDelayedPrefabWithBundle(prefabName: string, prefabProperty: string) {
        const path = `/prefabs/${prefabName}`;
        const devPath = `../games/*/${path}`;
        try {
            const prefab = await BundleManager.getInstance().loadAsset<cc.Prefab>({
                bundleId: this.gameId.toString(),
                path: path,
                pathForDevMode: devPath,
                type: cc.Prefab
            });

            this[prefabProperty] = prefab;
        } catch (e) {
            cc.warn(`Missing prefab for ${path} `, e);
        }
    }

    protected getDelayedPrefabsList(): Record<string, string> {
        return {
            "dialog-bonus": "bonusDialog",
            
            "effect-big-win": "effectBigWin",
            "effect-bonus": "effectBonus",
            "effect-freespin": "effectFreeSpin",

            "effect-jackpot": "effectJackpot",
        };
    }

    protected getAudioDictionary(): Record<string, string> {
        return {
            [ClassicSlotSound.SPIN]: "spin-button",
            [ClassicSlotSound.WIN]: "win",
            // [ClassicSlotSound.BIG_WIN]: "big-win",
            // [ClassicSlotSound.JACKPOT]: "jackpot-hit",
            // [ClassicSlotSound.JACKPOT_ITEM]: "jackpot-item",
            // [ClassicSlotSound.JACKPOT_WIN]: "jackpot-win",

            // [ClassicSlotSound.FREESPIN]: "freespin",
            // [ClassicSlotSound.BONUS]: "bonus",
            [ClassicSlotSound.SPINNING_NORMAL]: "spinning-normal",
            [ClassicSlotSound.SPINNING_TURBO]: "spinning-turbo",

            [ClassicSlotSound.REEL_STOP]: "reel-stop",
            // [ClassicSlotSound.BONUS_POPUP]: "bonus-popup",
            // [ClassicSlotSound.BONUS_ITEM]: "bonus-item",
            [ClassicSlotSound.CLICK]: "click",
            // [ClassicSlotSound.BONUS_TOTAL]: "bonus-total",

            [ClassicSlotSound.TRANSITION]: "transition",
            [ClassicSlotSound.SYMBOL_WIN]: "symbol-win"
        };
    }

    protected getDelayedAudiosDictionary(): Record<string, string> {
        return {
            [ClassicSlotSound.BIG_WIN]: "big-win",
            [ClassicSlotSound.JACKPOT]: "jackpot-hit",
            [ClassicSlotSound.JACKPOT_ITEM]: "jackpot-item",
            [ClassicSlotSound.JACKPOT_WIN]: "jackpot-win",

            [ClassicSlotSound.FREESPIN]: "freespin",
            [ClassicSlotSound.BONUS]: "bonus",

            [ClassicSlotSound.BONUS_POPUP]: "bonus-popup",
            [ClassicSlotSound.BONUS_ITEM]: "bonus-item",
            [ClassicSlotSound.BONUS_TOTAL]: "bonus-total"
        };
    }

    loadDelayedAudios() {
        const dict = this.getDelayedAudiosDictionary();

        for (const key of Object.keys(dict)) {
            console.log("start loadAudio delayed", dict[key]);

            const path = `audios/${dict[key]}`;
            const devPath = `../games/*/${path}`;
            BundleManager.getInstance()
                .loadAsset<cc.AudioClip>({
                    bundleId: this.gameId.toString(),
                    path: path,
                    pathForDevMode: devPath,
                    type: cc.AudioClip
                })
                .then((clip) => {
                    console.log("end loadAudio delayed", dict[key]);
                    if (clip) {
                        this.audioClips[key] = clip;
                    }
                })
                .catch(() => {
                    cc.warn("missing audio for", path);
                });
        }
    }
}
