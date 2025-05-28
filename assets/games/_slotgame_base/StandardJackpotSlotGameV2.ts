import { BundleManager } from "bundle-management";
import GameUtils from "../../common/GameUtils";
import { ClassicSlotSound } from "./ClassicSlotSound";
import StandardJackpotSlotGame from "./StandardJackpotSlotGame";

const { ccclass } = cc._decorator;

@ccclass
export default class StandardJackpotSlotGameV2 extends StandardJackpotSlotGame {
    protected getPrefabsList(): Record<string, string> {
        return {};
    }

    start() {
        this.loadDelayedAudios();
        this.loadDelayedPrefabsByCode().then(() => {
            if (this.autoGenerateLines) {
                this.createAllLines();
            }
        });
    }

    private async loadDelayedPrefabsByCode() {
        const dict = this.getDelayedPrefabsList();

        try {
            for (const key of Object.keys(dict)) {
                await GameUtils.asyncExecute(this?.node, this.loadPrefabWithBundle(key, dict[key], ""));
            }
        } catch (error) {
            cc.warn("Error occur when lazy load prefabs ", error);
        }
    }

    protected getDelayedPrefabsList(): Record<string, string> {
        return {
            // prefab name : prefab property
            "effect-transition": "effectTransitionPrefab",

            "effect-bonus": "effectBonus",
            "effect-big-win": "effectBigWin",
            "effect-freespin": "effectFreeSpin",

            "dialog-bonus": "bonusDialog",

            "line-normal": "linePrefab",
            "line-glow": "lightLinePrefab",

            "preview-symbol-left": "previewSymbolLeft",
            "preview-symbol-right": "previewSymbolRight",

            "effect-jackpot": "effectJackpot"
        };
    }

    protected getAudioDictionary(): Record<string, string> {
        return {
            [ClassicSlotSound.SPIN]: "spin-button",
            [ClassicSlotSound.WIN]: "win",
            [ClassicSlotSound.SPINNING_NORMAL]: "spinning-normal",
            [ClassicSlotSound.SPINNING_TURBO]: "spinning-turbo",

            [ClassicSlotSound.REEL_STOP]: "reel-stop",
            [ClassicSlotSound.CLICK]: "click",

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

    private loadDelayedAudios() {
        const dict = this.getDelayedAudiosDictionary();

        this.loadAudioFromDictionary(dict, "");
    }

    onSymbolPreview(symbol: any, worldPosition: cc.Vec3, isInfoOnLeft: boolean): void {
        if (isInfoOnLeft) {
            if (!this.previewSymbolLeft) {
                cc.warn("waiting for load previewSymbolLeft");
                return;
            }
        } else if (!this.previewSymbolRight) {
            cc.warn("waiting for load previewSymbolRight");
            return;
        }
        super.onSymbolPreview(symbol, worldPosition, isInfoOnLeft);
    }
    async handleNewJackpot(jackpot: any) {
        try {
            if (!this.effectJackpot) {
                await this.loadPrefabWithBundle("effect-jackpot", "effectJackpot", "");
            }
            await super.handleNewJackpot(jackpot);
        } catch (error) {
            cc.warn("Error when show effect jackpot", error);
        }
    }
}
