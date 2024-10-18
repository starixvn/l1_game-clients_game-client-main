import AnimationUtils from "../../../common/utils/AnimationUtils";
import SevenUpDownDice from "./SevenUpDownDice";
import { ISevenUpDownResult } from "./SevenUpDownTypes";

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

    private resultDiceFrames: IResultDiceFrames;
    private diceSpriteFrames: cc.SpriteFrame[] = [];
    private dicePositionNumber = 7;
    resultDuration = 1.3;

    onLoad() {
        this.resetResultDiceFrames();
        this.initDiceSpriteFrames();
    }

    initDiceSpriteFrames() {
        this.diceSpriteFrames = this.diceAtlas.getSpriteFrames();
        this.diceSpriteFrames.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    }

    private resetResultDiceFrames() {
        this.resultDiceFrames = { dice1: [], dice2: [] };
    }

    private getDiceAnimationName(roundId: number): string {
        const position = roundId % this.dicePositionNumber || this.dicePositionNumber;
        const nextPosition = (position % this.dicePositionNumber) + 1;

        return `s${position}-e${nextPosition}`;
    }

    showResultNoAnim(result: ISevenUpDownResult, roundId: number) {
        this.diceSkeleton && AnimationUtils.pauseSpineAnimation(this.diceSkeleton, 1, this.getDiceAnimationName(roundId));
        this.dicesComponent.forEach((dice, index) => {
            dice.setFrame(this.diceSpriteFrames.find((spriteFrame) => spriteFrame.name === `end-${result[`dice${index + 1}`]}`));
        });
    }

    async showResultAnim(prevResult: ISevenUpDownResult, result: ISevenUpDownResult, roundId: number) {
        this.resetResultDiceFrames();
        await this.setResultDiceFrames(prevResult, result);
        this.diceSkeleton && AnimationUtils.playSpine(this.diceSkeleton, this.getDiceAnimationName(roundId), false, this.resultDuration);
        this.dicesComponent.forEach((dice, index) => {
            dice.runAnimation(this.resultDiceFrames[`dice${index + 1}`]);
        });
    }

    private getRandomNumber(max: number): string {
        const randomNumber = Math.floor(Math.random() * max) + 1;
        return randomNumber.toString().padStart(2, "0");
    }

    private async setResultDiceFrames(prevResult: ISevenUpDownResult, result: ISevenUpDownResult) {
        for (let i = 0; i < this.dicesComponent.length; i++) {
            const files = [`start-${prevResult[`dice${i + 1}`]}`, `loop-${this.getRandomNumber(3)}`, `end-${result[`dice${i + 1}`]}`];
            for (const file of files) {
                const matchingFrames = this.diceSpriteFrames.filter((frame) => frame.name.startsWith(file));
                this.resultDiceFrames[`dice${i + 1}`].push(...matchingFrames);
            }
        }
    }
}
