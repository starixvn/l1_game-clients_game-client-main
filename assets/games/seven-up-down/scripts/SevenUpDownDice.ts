const { ccclass, property } = cc._decorator;

@ccclass
export default class SevenUpDownDice extends cc.Component {
    @property(cc.Sprite)
    diceSprite: cc.Sprite = null;

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

    runAnimation(resultDiceFrames: cc.SpriteFrame[]) {
        resultDiceFrames.forEach((spriteFrame) => {
            this.setFrame(spriteFrame);
        });
    }
}
