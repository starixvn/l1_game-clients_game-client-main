const { ccclass, property } = cc._decorator;

@ccclass
export default class SingleBetControl extends cc.Component {
    showControl() {
        this.node.active = true;
    }

    hideControl() {
        this.node.active = false;
    }
}
