const { ccclass, property } = cc._decorator;

@ccclass
export default class SevenUpDownResult extends cc.Component {
    @property(cc.Sprite)
    dice1: cc.Sprite = null;

    @property(cc.Sprite)
    dice2: cc.Sprite = null;
}
