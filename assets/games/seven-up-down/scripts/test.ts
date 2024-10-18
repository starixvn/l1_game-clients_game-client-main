import AnimationUtils from "../../../common/utils/AnimationUtils";
import SevenUpDownDice from "./SevenUpDownDice";

const { ccclass, property } = cc._decorator;

interface IResult {
    dice1: string | undefined;
    dice2: string | undefined;
}

interface IResultDiceFrames {
    dice1: cc.SpriteFrame[];
    dice2: cc.SpriteFrame[];
}
@ccclass
export default class Test extends cc.Component {
    @property(SevenUpDownDice)
    dicesComponent: SevenUpDownDice[] = [];

    @property(sp.Skeleton)
    diceSkeleton: sp.Skeleton = null;

    @property(cc.SpriteAtlas)
    diceAtlas: cc.SpriteAtlas = null;

    private defaultValuesDiceFrames = { dice1: [], dice2: [] };

    private prevResult: IResult = { dice1: "01", dice2: "02" };
    private currentResult: IResult = { dice1: null, dice2: null };
    private resultDiceFrames: IResultDiceFrames;
    private diceSpriteFrames: cc.SpriteFrame[] = [];
    private roundId = 0;

    onLoad() {
        this.resultDiceFrames = this.defaultValuesDiceFrames;
        this.diceSpriteFrames = this.diceAtlas.getSpriteFrames();
        this.diceSpriteFrames.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    }

    increaseRound() {
        this.roundId++;
    }

    async showResult() {
        this.increaseRound();
        this.setCurrentResult();
        this.resultDiceFrames = this.defaultValuesDiceFrames;

        await this.setResultDiceFrames();

        this.diceSkeleton && AnimationUtils.playSpine(this.diceSkeleton, "postion-1", false);

        this.dicesComponent.forEach((dice, index) => {
            dice.runAnimation(this.resultDiceFrames[`dice${index + 1}`]);
        });

        this.prevResult = this.currentResult;
    }

    private generateUniquePair(): [number, number] {
        const end1 = (this.roundId % 4) + 1;
        let end2;

        do {
            end2 = (end1 % 3) + 1;
        } while (end1 === end2);
        return [end1, end2];
    }

    setCurrentResult() {
        this.currentResult = { dice1: this.getRandomNumber(6), dice2: this.getRandomNumber(6) };
    }

    private getRandomNumber(max: number): string {
        const randomNumber = Math.floor(Math.random() * max) + 1;
        return randomNumber.toString().padStart(2, "0");
    }

    private async setResultDiceFrames() {
        for (let i = 0; i < this.dicesComponent.length; i++) {
            const files = [
                `start-${this.prevResult[`dice${i + 1}`]}`,
                `loop-${this.getRandomNumber(3)}`,
                `end-${this.currentResult[`dice${i + 1}`]}`
            ];
            for (const file of files) {
                const matchingFrames = this.diceSpriteFrames.filter((frame) => frame.name.startsWith(file));
                this.resultDiceFrames[`dice${i + 1}`].push(...matchingFrames);
            }
        }
    }
}
