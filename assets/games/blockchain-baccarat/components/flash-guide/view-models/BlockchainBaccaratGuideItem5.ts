import BlockchainBaccaratGuideItem from "./BlockchainBaccaratGuideItem";
const { ccclass, property } = cc._decorator;

@ccclass
export default class BlockchainBaccaratGuideItem5 extends BlockchainBaccaratGuideItem {
    @property(cc.SpriteFrame)
    stampEn: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    stampVi: cc.SpriteFrame = null;

    @property(cc.Sprite)
    stampSprite: cc.Sprite = null;

    show() {
        super.show();
    }
}
