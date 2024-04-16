import AnimatedTime from "../../../common/animated-time/view-models/AnimatedTime";

const { ccclass } = cc._decorator;

@ccclass
export default class FootballSlotAnimatedTimer extends AnimatedTime {
    isShowWaiting = false;

    setRedTime(time: number) {
        this.timeToChangeColor = time;
    }

    setAnimatedY(yTop: number, yBottom: number) {
        this.animatedYTop = yTop;
        this.animatedYBottom = yBottom;
    }

    resetTime() {}

    public setTime(time: number | string, forceChangeColor = false) {
        this.node.active = true;
        const firstTimeChar = time.toString().slice(0, 1);
        const secondTimeChar = time.toString().slice(1, 2);

        if (this.firstChar.string !== firstTimeChar) {
            this.handleBetTimeAnimation(this.firstChar.node);
        }

        this.handleBetTimeAnimation(this.secondChar.node);
        this.firstChar.string = firstTimeChar;
        this.secondChar.string = secondTimeChar;

        const colorChange = forceChangeColor || (this.timeToChangeColor !== undefined && time <= this.timeToChangeColor);
        this.firstChar.node.color = colorChange ? this.changedColor : cc.Color.WHITE;
        this.secondChar.node.color = this.firstChar.node.color;

        if (colorChange) {
            this.playAnimationLockBet();
        }
    }

    handleBetTimeAnimation(node: cc.Node) {}

    playAnimationLockBet() {
        cc.tween(this.firstChar.node).to(0.1, { scale: 1.3 }).to(0.1, { scale: 1 }).start();
        cc.tween(this.secondChar.node).to(0.1, { scale: 1.3 }).to(0.1, { scale: 1 }).start();
    }
}
