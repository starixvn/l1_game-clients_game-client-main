import BlockchainBaccaratGuideItem from "./BlockchainBaccaratGuideItem";
const { ccclass, property } = cc._decorator;

@ccclass
export default class BlockchainBaccaratGuideItem1 extends BlockchainBaccaratGuideItem {
    @property(cc.Node)
    arrow: cc.Node = null;

    show() {
        this.setPositionArrow();
        super.show();
    }

    private setPositionArrow() {
        let position;
        this.arrow.opacity = 0;
        const longLanguage = ["ja", "vi", "es"];
        if (!longLanguage.includes(window.i18n.curLang)) {
            position = new cc.Vec2(-320, this.arrow.y);
            this.arrow.position = position;
            this.arrow.runAction(
                cc.spawn(
                    cc.fadeTo(0.8, 255).easing(cc.easeInOut(2)),
                    cc.moveTo(0.8, cc.v2(position.x + 50, position.y)).easing(cc.easeInOut(2))
                )
            );
        } else {
            position = new cc.Vec2(-400, this.arrow.y);
            this.arrow.position = position;
            this.arrow.runAction(
                cc.spawn(
                    cc.fadeTo(0.5, 255).easing(cc.easeInOut(2)),
                    cc.moveTo(0.5, cc.v2(position.x + 50, position.y)).easing(cc.easeInOut(2))
                )
            );
        }
    }
}
