import SpineAttachmentNode from "../../../common/SpineAttachmentNode";
import AnimationUtils from "../../../common/utils/AnimationUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SevenUpDownDice extends cc.Component {
    @property(cc.Sprite)
    diceSprite: cc.Sprite = null;

    setBone(boneName: string) {
        const spineComp = this.diceSprite.node.getComponent(SpineAttachmentNode);
        if (!spineComp) {
            return;
        }
        spineComp.updateBoneName(boneName);
    }

    setFrame(spriteFrame: cc.SpriteFrame) {
        this.diceSprite.spriteFrame = spriteFrame;
    }

    async runAnimation(resultDiceFrames: cc.SpriteFrame[], diceSkeleton: sp.Skeleton, animationName: string, trackIndex: number) {
        diceSkeleton && AnimationUtils.playSpine(diceSkeleton, animationName, false, null, trackIndex);

        this.setAllFrame(resultDiceFrames);
    }

    async setAllFrame(resultDiceFrames: cc.SpriteFrame[]) {
        resultDiceFrames.forEach((spriteFrame) => {
            this.setFrame(spriteFrame);
        });
    }
}
