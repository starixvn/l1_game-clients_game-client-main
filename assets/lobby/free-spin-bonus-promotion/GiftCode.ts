import DraggableItem from "../../common/draggable-layout/view-models/DraggableItem";
import { FreeSpinsPromotionEvents } from "../../lobby/free-spin-bonus-promotion/FreeSpinsPromotionHandler";
import { uiManager } from "../../managers/GameUIManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GiftCode extends cc.Component {
    @property(cc.Node)
    icon: cc.Node = null;
    private isProcessing = false;
    onEnable() {
        this.dragGiftCode();
    }
    dragGiftCode() {
        const draggableItem = this.getComponent(DraggableItem);
        if (draggableItem) {
            draggableItem.touchCallback.end = (isClicked) => {
                if (isClicked) {
                    this.onClickGiftCode();
                }
            };
        }
    }
    onClickGiftCode() {
        if (this.isProcessing) {
            return;
        }
        this.isProcessing = true;

        this.isProcessing = true;
        uiManager.emitter.emit(FreeSpinsPromotionEvents.OPEN_GIFT_CODE_REDEEM_POPUP);

        this.scheduleOnce(() => {
            this.isProcessing = false;
        }, 1);
    }
}
