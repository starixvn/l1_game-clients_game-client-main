import AnimationUtils from "../../../common/utils/AnimationUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SevenUpDownDice extends cc.Component {
    @property(cc.Sprite)
    diceSprite: cc.Sprite = null;

    private readonly durationTime = 2;
    private readonly totalFrames = 42;

    async setFrame(spriteFrame: cc.SpriteFrame) {
        this.diceSprite.spriteFrame = spriteFrame;
        await AnimationUtils.delayTime(this.durationTime / this.totalFrames);
    }

    async runAnimation(resultDiceFrames: cc.SpriteFrame[], diceSkeleton: sp.Skeleton, trackIndex: number) {
        const animationName = trackIndex === 0 ? "dice-1-s1-e1" : "dice-1-s3-e2";

        diceSkeleton && AnimationUtils.playSpine(diceSkeleton, animationName, false, this.durationTime, trackIndex);

        for (const spriteFrame of resultDiceFrames) {
            await this.setFrame(spriteFrame);
        }
    }
}
