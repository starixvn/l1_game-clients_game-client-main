import { FreeSpinsPromotionEvents } from "../../../lobby/promotions/FreeSpinsPromotionHandler";
import { uiManager } from "../../../managers/GameUIManager";
import Draggable from "./Draggable";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GiftCode extends cc.Component {
    @property(cc.Node)
    icon: cc.Node = null;
    private isProcessing = false;
    onEnable() {
        this.setDefaultPosition();
        const draggable = this.getComponent(Draggable);
        if (draggable) {
            draggable.onClickCallback = this.onClickGiftCode.bind(this);
        }
    }

    setDefaultPosition() {
        const winSize = cc.winSize;
        const x = -winSize.width / 2 + this.node.width / 2 + 20;
        const y = 0;
        this.node.setPosition(x, y);
    }

    onClickGiftCode() {
        if (this.isProcessing) {
            return;
        }
        this.isProcessing = true;

        uiManager.emitter.emit(FreeSpinsPromotionEvents.CHECK_IS_SPINNING, (isSpinning: boolean) => {
            if (isSpinning) {
                this.isProcessing = false;
                return;
            }

            uiManager.emitter.emit(FreeSpinsPromotionEvents.OPEN_GIFT_CODE_REDEEM_POPUP);

            this.scheduleOnce(() => {
                this.isProcessing = false;
            }, 1);
        });
    }
}
