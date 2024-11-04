const { ccclass, property } = cc._decorator;

@ccclass
export default class SevenUpDownDice extends cc.Component {
    @property(cc.Sprite)
    diceSprite: cc.Sprite = null;

    private diceAnimation: cc.Tween = null;

    onLoad() {
        this.setOpacity(0);
    }

    setOpacity(opacity: number) {
        this.diceSprite.node.opacity = opacity;
    }

    setFrame(spriteFrame: cc.SpriteFrame) {
        this.setOpacity(255);
        this.diceSprite.spriteFrame = spriteFrame;
    }

    stopAnimation() {
        this.diceAnimation?.stop();
    }

    runAnimation(resultDiceFrames: cc.SpriteFrame[], duration: number) {
        let index = 0;
        const diceFramesNumber = resultDiceFrames.length;

        this.diceAnimation = cc
            .tween(this.diceSprite.node)
            .repeat(
                diceFramesNumber,
                cc
                    .tween()
                    .delay(duration / diceFramesNumber)
                    .call(() => {
                        this.setFrame(resultDiceFrames[index]);
                        index++;
                    })
            )
            .start();
    }
}
