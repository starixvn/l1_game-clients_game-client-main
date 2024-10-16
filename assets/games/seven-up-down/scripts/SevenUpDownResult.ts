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
    private diceSpriteFrames: cc.SpriteFrame[] = [];
    private roundId = 1;

    private dicePoints = {
        dice1: {
            start: 1,
            end: 2
        },
        dice2: {
            start: 2,
            end: 3
        }
    };

    onLoad() {
        this.diceSpriteFrames = this.diceAtlas.getSpriteFrames();
        this.diceSpriteFrames.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    }

    async showResult() {
        this.setCurrentResult();
        this.resultDiceFrames = { dice1: [], dice2: [] };

        const boneList = this.randomBoneName();
        console.log("-------boneList", boneList);

        this.setDiceBones(boneList);

        await this.setResultDiceFrames();

        this.dicesComponent.forEach((dice, index) => {
            dice.runAnimation(this.resultDiceFrames[`dice${index + 1}`], this.diceSkeleton, boneList[`dice${index + 1}`], index);
        });

        this.prevResult = this.currentResult;
    }

    randomBoneName() {
        const randomEnd1 = Math.floor(Math.random() * 3) + 1;
        const randomEnd2 = Math.floor(Math.random() * 3) + 1;

        this.dicePoints = {
            dice1: {
                start: this.dicePoints.dice1.end || randomEnd1,
                end: randomEnd1
            },
            dice2: {
                start: this.dicePoints.dice2.end || randomEnd2,
                end: randomEnd2
            }
        };

        return {
            dice1: `dice-1-s${this.dicePoints.dice1.start}-e${this.dicePoints.dice1.end}`,
            dice2: `dice-1-s${this.dicePoints.dice2.start}-e${this.dicePoints.dice2.end}`
        };
    }

    setDiceBones(boneList: IResult) {
        if (!boneList) {
            return;
        }

        this.dicesComponent.forEach((dice, index) => {
            dice.setBone(boneList[`dice${index + 1}`]);
        });
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
