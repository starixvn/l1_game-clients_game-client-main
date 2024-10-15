import AnimationUtils from "../../../common/utils/AnimationUtils";

const { ccclass, property } = cc._decorator;

interface IResult {
    dice1: string | undefined;
    dice2: string | undefined;
}

@ccclass
export default class SevenUpDownResult extends cc.Component {
    @property(cc.Sprite)
    diceSprite: cc.Sprite = null;

    @property(sp.Skeleton)
    diceSkeleton: sp.Skeleton = null;

    @property(cc.SpriteAtlas)
    diceAtlas: cc.SpriteAtlas = null;

    private prevResult: IResult = { dice1: "01", dice2: "02" };
    private currentResult: IResult = { dice1: null, dice2: null };
    private resultDiceFrames: cc.SpriteFrame[] = [];
    private durationTime = 2;
    private diceFrames: cc.SpriteFrame[] = [];

    onLoad() {
        this.diceFrames = this.diceAtlas.getSpriteFrames();
        this.diceFrames.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    }

    async showResult() {
        this.setCurrentResult();
        const animationName = "dice-1-s1-e1";
        this.resultDiceFrames = [];

        await this.loadDiceImages();
        this.diceSkeleton && AnimationUtils.playSpine(this.diceSkeleton, animationName, false, this.durationTime);
        await this.runAnimation();
        this.prevResult = this.currentResult;
    }

    setCurrentResult() {
        this.currentResult = { dice1: this.getRandomNumber(6), dice2: this.getRandomNumber(6) };
    }

    private getRandomNumber(max: number): string {
        const randomNumber = Math.floor(Math.random() * max) + 1;
        return randomNumber.toString().padStart(2, "0");
    }

    async setFrame(spriteFrame: cc.SpriteFrame) {
        this.diceSprite.spriteFrame = spriteFrame;
        await AnimationUtils.delayTime(this.durationTime / 42);
    }

    private async loadDiceImages() {
        const files = [`start-${this.prevResult.dice1}`, `loop-${this.getRandomNumber(3)}`, `end-${this.currentResult.dice1}`];

        for (const file of files) {
            const matchingFrames = this.diceFrames.filter((frame) => frame.name.startsWith(file));
            this.resultDiceFrames.push(...matchingFrames);
        }
    }

    private async runAnimation() {
        for (const spriteFrame of this.resultDiceFrames) {
            await this.setFrame(spriteFrame);
        }
    }
}
