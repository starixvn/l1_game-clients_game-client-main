import { BundleManager } from "bundle-management";
import GameUtils from "../../common/GameUtils";
import { ClassicSlotSound } from "./ClassicSlotSound";
import StandardJackpotSlotGame from "./StandardJackpotSlotGame";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StandardJackpotSlotGameV2 extends StandardJackpotSlotGame {
    @property({ type: cc.Prefab, visible: false, override: true })
    jackpotGamePrefab: cc.Prefab = null;

    protected getPrefabsList(): Record<string, string> {
        return {
            "preview-symbol-left": "previewSymbolLeft",
            "preview-symbol-right": "previewSymbolRight"
        };
    }

    start() {
        this.loadDelayedAudios();
        this.loadDelayedPrefabsByCode().then(() => {
            if (this.autoGenerateLines) {
                this.createAllLines();
            }
        });
        this.preloadAnimSprites();
        this.preloadJackpotGamePrefab();
    }

    async preloadJackpotGamePrefab() {
        try {
            cc.log("Preloading jackpot game prefab");
            this.jackpotGamePrefab = await GameUtils.loadResource(`shared/slot-game/jackpot-game`);
        } catch (e) {
            cc.warn(`Missing jackpot game`, e);
        }
    }

    private preloadAnimSprites() {
        const animSprites = ["bonus-popup/bonus-item"];

        for (const anim of animSprites) {
            this.loadAnimSprite(anim);
        }
    }

    protected loadAnimSprite(animSprite: string) {
        const animFolder = "resources/spine";

        const combinedPath = (animPath) => `${animFolder}/${animPath}`;

        const path = combinedPath(animSprite);
        const devPath = `../games/*/${path}`;
        BundleManager.getInstance()
            .loadAsset<cc.SpriteFrame>({
                bundleId: this.gameId.toString(),
                path: path,
                pathForDevMode: devPath,
                type: cc.SpriteFrame
            })
            .catch(() => {
                cc.warn("missing  anim sprite for", path);
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
}
