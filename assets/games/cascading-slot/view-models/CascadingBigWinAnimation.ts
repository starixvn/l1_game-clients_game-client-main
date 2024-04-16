import GameUtils from "../../../common/GameUtils";
import { numberWithCommas } from "../../../common/helpers/NumberHelper";
import BigWinAnimation from "../../_slotgame_base/BigWinAnimation";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CascadingBigWinAnimation extends BigWinAnimation {
    @property(cc.Prefab)
    megaWinPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    superWinPrefab: cc.Prefab = null;

    @property(sp.Skeleton)
    mainSpine: sp.Skeleton = null;

    @property(cc.Node)
    changeLevel: cc.Node = null;

    @property(cc.Node)
    bigWinNode: cc.Node = null;

    private isChangeLevelSuper = true;
    private isChangeLevelMega = true;

    async changeFrameForBigWinLevel(betWin: number, totalBet: number) {
        const valueRatio = betWin / totalBet;
        if (valueRatio >= 6) {
            this.isChangeLevelSuper && this.setAnimationChangeSuper();
        } else if (valueRatio >= 3) {
            this.isChangeLevelMega && this.setAnimationChangeMega();
        }
    }

    showHideBigWinNode(show: boolean) {
        this.bigWinNode.active = show;
    }

    async setAnimationChangeSuper() {
        this.isChangeLevelSuper = false;
        await this.changeLevelAnimation(this.mainSpine, "hide", this.superWinPrefab);
    }

    async setAnimationChangeMega() {
        this.isChangeLevelMega = false;
        await this.changeLevelAnimation(this.mainSpine, "hide", this.megaWinPrefab);
    }

    async changeLevelAnimation(skeleton: sp.Skeleton, animation: string, levelPrefab: cc.Prefab) {
        skeleton.setAnimation(0, animation, false);
        const duration = skeleton.findAnimation(animation)?.duration || 0;
        if (duration > 0) {
            await GameUtils.delayTime(0.1);
        }
        const node = cc.instantiate(levelPrefab);
        this.changeLevel.removeAllChildren();
        this.changeLevel.addChild(node);
    }

    async showWinAmountForBigWinAnim(amount: number, totalBet: number, coinValue: number, onComplete: () => void) {
        await this.floatNumberBigWin({ label: this.amountLabel, amount, totalBet, coinValue });
        onComplete();
    }

    floatNumberBigWin(opt: { label: cc.Label; amount: number; start?: number; totalBet?: number; coinValue?: number }) {
        return new Promise<void>((resolve) => {
            const { label, amount: end, start, totalBet, coinValue } = opt;
            const prefixStr = "";
            const defaultFormater = (v) => numberWithCommas(v, 2, false);
            const formatNumber = defaultFormater;
            const stepValue = parseFloat(this.calculateStepValue(coinValue));
            const stepTime = 0.05;
            const startStr = label.string.replace(prefixStr, "");
            const startValue = start || parseFloat(startStr.replace(/,/g, "")) || 0;
            const range = Math.abs(end - startValue);

            if (!range) {
                resolve();
                return;
            }

            const repeatCount = Math.floor(range / stepValue);

            let value = startValue;
            label.node.stopAllActions();
            const formatText = (value) => prefixStr + formatNumber(value);
            cc.tween(label.node)
                .repeat(
                    repeatCount,
                    cc
                        .tween(label.node)
                        .call(() => {
                            label.string = formatText(value);
                            value += stepValue;

                            this.changeFrameForBigWinLevel(value, totalBet);
                        })
                        .delay(stepTime)
                )
                .call(() => {
                    label.string = formatText(end);
                    resolve();
                })
                .start();
        });
    }

    private calculateStepValue(coinValue: number) {
        const stringArr = coinValue.toString().split(".");
        const integr = stringArr[0];
        const decimal = stringArr[1];

        if (stringArr.length > 1) {
            if (decimal.length > 2) {
                return coinValue.toString();
            }
            let coin = "0.";
            for (let i = 0; i < decimal.length - 1; i++) {
                coin += "0";
            }
            return coin + "1";
        } else {
            let coin = "1";
            for (let i = 0; i < integr.length - 1; i++) {
                coin += "0";
            }
            return coin;
        }
    }
}
