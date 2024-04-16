const { ccclass, property } = cc._decorator;

@ccclass
export default class FootballSlotLedLightItem extends cc.Component {
    @property(cc.Node)
    ledItem: cc.Node = null;

    public setHighlightItems() {
        if (this.ledItem) {
            cc.tween(this.ledItem).to(0.05, { opacity: 255 }).delay(0.1).to(0.05, { opacity: 0 }).start();
        }
    }

    public resetHighlight() {
        this.ledItem.opacity = 0;
        this.ledItem && (this.ledItem.opacity = 0);
    }
}