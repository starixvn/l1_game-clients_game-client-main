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
export default class SevenUpDownResult extends cc.Component {
    @property(SevenUpDownDice)
    dicesComponent: SevenUpDownDice[] = [];

    @property(sp.Skeleton)
    diceSkeleton: sp.Skeleton = null;

    @property(cc.SpriteAtlas)
    diceAtlas: cc.SpriteAtlas = null;

    private prevResult: IResult = { dice1: "01", dice2: "02" };
    private currentResult: IResult = { dice1: null, dice2: null };
    private resultDiceFrames: IResultDiceFrames = { dice1: [], dice2: [] };
    private durationTime = 2;
    private diceSpriteFrames: cc.SpriteFrame[] = [];

    onLoad() {
        this.diceSpriteFrames = this.diceAtlas.getSpriteFrames();
        this.diceSpriteFrames.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    }

    async showResult() {
        this.setCurrentResult();
        // const animationName = "dice-1-s1-e1";
        this.resultDiceFrames = { dice1: [], dice2: [] };
        await this.setResultDiceFrames();
        // this.diceSkeleton && AnimationUtils.playSpine(this.diceSkeleton, animationName, false, this.durationTime);
        this.dicesComponent.forEach((dice, index) => {
            dice.runAnimation(this.resultDiceFrames[`dice${index + 1}`], this.diceSkeleton, index);
        });
        this.prevResult = this.currentResult;
    }

    setCurrentResult() {
        this.currentResult = { dice1: this.getRandomNumber(6), dice2: this.getRandomNumber(6) };
    }

    private getRandomNumber(max: number): string {
        const randomNumber = Math.floor(Math.random() * max) + 1;
        return randomNumber.toString().padStart(2, "0");
    }

    private async setResultDiceFrames() {
        this.dicesComponent.forEach((dice, index) => {
            // const diceFrames = this.diceSpriteFrames.filter((frame) => frame.name.startsWith(this.currentResult[`dice${index + 1}`]));
            // this.resultDiceFrames[`dice${index + 1}`] = diceFrames;

            const files = [
                `start-${this.prevResult[`dice${index + 1}`]}`,
                `loop-${this.getRandomNumber(3)}`,
                `end-${this.currentResult[`dice${index + 1}`]}`
            ];
            for (const file of files) {
                const matchingFrames = this.diceSpriteFrames.filter((frame) => frame.name.startsWith(file));
                this.resultDiceFrames[`dice${index + 1}`].push(...matchingFrames);
            }
        });
    }
}
