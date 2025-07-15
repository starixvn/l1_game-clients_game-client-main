import GameUtils from "../../common/GameUtils";

const { ccclass, property } = cc._decorator;

export enum FreeSpinsPromotionMessageType {
    FREESPINS_PROMOTION = 0
}

@ccclass
export default class FreeSpinsPromotionMessage extends cc.Component {
    @property(cc.Label)
    msgText: cc.Label = null;

    @property(cc.Node)
    msgNode: cc.Node = null;

    showMessageContent() {
        const msg = GameUtils.getText(`FreeSpinBonus.FSB_pending_freespin_msg`);
        this.msgText.string = msg;
        this.msgNode.active = true;
        cc.tween(this.msgNode)
            .delay(3)
            .call(() => {
                this.msgNode.active = false;
            })
            .start();
    }
}
