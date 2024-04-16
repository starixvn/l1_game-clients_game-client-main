const { ccclass, property } = cc._decorator;

@ccclass
export default class BlockchainBlinkHighLight extends cc.Component {
    @property
    interval = 0.3;

    @property
    times = 2;

    onEnable() {
        this.playAnimation();
    }

    playAnimation() {
        const action = cc.sequence(cc.fadeOut(this.interval), cc.fadeIn(this.interval));
        const repeat = cc.repeat(action, this.times);
        this.node.runAction(repeat);
    }

    onDisable() {
        this.node.stopAllActions();
    }
}
