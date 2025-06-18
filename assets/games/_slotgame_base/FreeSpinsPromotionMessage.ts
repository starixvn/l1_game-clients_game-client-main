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
        const msg = GameUtils.getText(`messages.freeSpinsPromotionMsg`);
        this.msgText.string = msg.toUpperCase();

        // Bật hiển thị node (nếu đang bị ẩn)
        this.msgNode.active = true;

        // Hiển thị trong 3s rồi ẩn
        cc.tween(this.msgNode)
            .delay(3)
            .call(() => {
                this.msgNode.active = false;
            })
            .start();
    }
}
