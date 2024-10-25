import AnimationUtils from "../../../common/utils/AnimationUtils";
import SevenUpDownDice from "./SevenUpDownDice";
import { ISevenUpDownResult, SevenUpDownChoice } from "./SevenUpDownTypes";

const { ccclass, property } = cc._decorator;

interface IResultDiceFrames {
    dice1: cc.SpriteFrame[];
    dice2: cc.SpriteFrame[];
}
@ccclass
export default class SevenUpDownResult extends cc.Component {
    @property(SevenUpDownDice)
    dicesComponent: SevenUpDownDice[] = [];

    @property(sp.Skeleton)
    diceSkeleton: sp.Skeleton = null;

    @property(cc.SpriteAtlas)
    diceAtlas: cc.SpriteAtlas = null;

    @property(cc.Node)
    nodeResult: cc.Node = null;

    @property(cc.Label)
    lblResult: cc.Label = null;

    private resultDiceFrames: IResultDiceFrames;
    private diceSpriteFrames: cc.SpriteFrame[] = [];
    private DICE_POSITION_NUMBER = 7;
    RESULT_DURATION = 1.3;
    LOOP_NUMBER = 2;
    DICE_END_FRAME = 11;

    onLoad() {
        this.setResultNodeVisibility(false);
        this.resetResultDiceFrames();
        this.initDiceSpriteFrames();
    }

    private initDiceSpriteFrames() {
        this.diceSpriteFrames = this.diceAtlas.getSpriteFrames();
        this.diceSpriteFrames.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    }

    private resetResultDiceFrames() {
        this.resultDiceFrames = { dice1: [], dice2: [] };
    }

    private getDiceAnimationName(roundId: number): string {
        const position = roundId % this.DICE_POSITION_NUMBER || this.DICE_POSITION_NUMBER;
        const nextPosition = (position % this.DICE_POSITION_NUMBER) + 1;

        return `s${position}-e${nextPosition}`;
    }

    showResultNoAnim(result: ISevenUpDownResult, roundId: number) {
        this.diceSkeleton && AnimationUtils.pauseSpineAnimation(this.diceSkeleton, 1, this.getDiceAnimationName(roundId));
        this.dicesComponent.forEach((dice, index) => {
            dice.setFrame(
                this.diceSpriteFrames.find((spriteFrame) => spriteFrame.name === `end-${result[`dice${index + 1}`]}-${this.DICE_END_FRAME}`)
            );
        });
    }

    setResultNodeVisibility(isShow: boolean) {
        if (!this.nodeResult) {
            return;
        }

        this.nodeResult.active = isShow;

        if (!isShow) {
            this.nodeResult.opacity = 0;
            return;
        }

        cc.tween(this.nodeResult).to(0.2, { scale: 1.2 }, { easing: "bounceOut" }).to(0.3, { scale: 1, opacity: 255 }).start();
    }

    private determineWinningChoice(totalPoints: number): string {
        if (totalPoints === 7) {
            return "7";
        }

        return totalPoints > 6 ? `${totalPoints} - ${SevenUpDownChoice.UP}` : `${totalPoints} - ${SevenUpDownChoice.DOWN}`;
    }

    displayTotalPoints(result: ISevenUpDownResult) {
        this.setResultNodeVisibility(true);

        const totalPoints = this.calcTotalPoints(result);
        const choiceWin = this.determineWinningChoice(totalPoints);

        if (this.lblResult) {
            this.lblResult.string = choiceWin.toUpperCase();
        }
    }

    calcTotalPoints(result: ISevenUpDownResult): number {
        return ["dice1", "dice2"].map((key) => result[key]).reduce((sum, value) => sum + value, 0);
    }

    async showResultAnim(prevResult: ISevenUpDownResult, result: ISevenUpDownResult, roundId: number) {
        this.resetResultDiceFrames();
        this.setResultDiceFrames(prevResult, result);
        this.diceSkeleton && AnimationUtils.playSpine(this.diceSkeleton, this.getDiceAnimationName(roundId), false, this.RESULT_DURATION);
        this.dicesComponent.forEach((dice, index) => {
            dice.runAnimation(this.resultDiceFrames[`dice${index + 1}`], this.RESULT_DURATION);
        });
        await AnimationUtils.delayTime(this.RESULT_DURATION);
        this.displayTotalPoints(result);
    }

    private getRandomNumber(max: number): number {
        return Math.floor(Math.random() * max) + 1;
    }

    private setResultDiceFrames(prevResult: ISevenUpDownResult, result: ISevenUpDownResult) {
        for (let i = 0; i < this.dicesComponent.length; i++) {
            const files = [
                `start-${prevResult[`dice${i + 1}`]}`,
                `loop-${this.getRandomNumber(this.LOOP_NUMBER)}`,
                `end-${result[`dice${i + 1}`]}`
            ];
            for (const file of files) {
                const matchingFrames = this.diceSpriteFrames.filter((frame) => frame.name.startsWith(file));
                this.resultDiceFrames[`dice${i + 1}`].push(...matchingFrames);
            }
        }
    }
}
