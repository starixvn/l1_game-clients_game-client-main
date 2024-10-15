import GameUtils from "../../../common/GameUtils";
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

    private prevResult: IResult = { dice1: "01", dice2: "02" };
    private currentResult: IResult = { dice1: null, dice2: null };
    private diceFrames: cc.SpriteFrame[] = [];
    private durationTime = 2;

    async showResult() {
        this.setCurrentResult();
        const animationName = "dice-1-s1-e1";
        this.diceFrames = [];

        await this.loadDiceImages();
        this.diceSkeleton && AnimationUtils.playSpine(this.diceSkeleton, animationName, false, this.durationTime);
        this.runAnimation();
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

    async loadAtlasFile(file: string) {
        try {
            const atlas = await GameUtils.loadAssetsFromBundle<cc.SpriteAtlas>(`80`, `textures/dices/${file}`, cc.SpriteAtlas, null);
            const spriteFrames: cc.SpriteFrame[] = atlas.getSpriteFrames();
            spriteFrames.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
            this.diceFrames.push(...spriteFrames);
        } catch (error) {
            console.error(`Failed to load atlas file: ${file}`, error);
        }
    }

    private async loadDiceImages() {
        const files = [`start-${this.prevResult.dice1}`, `loop-${this.getRandomNumber(3)}`, `end-${this.currentResult.dice1}`];

        for (const file of files) {
            await this.loadAtlasFile(file);
        }

        this.prevResult = this.currentResult;
    }

    private async runAnimation() {
        for (const spriteFrame of this.diceFrames) {
            await this.setFrame(spriteFrame);
        }
    }
}
