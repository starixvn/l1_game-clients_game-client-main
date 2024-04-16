import CascadingSlotTumbleList from "./CascadingSlotTumbleList";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StandardCascadingSlotTumbleList extends CascadingSlotTumbleList {
    @property(cc.Node)
    maskNode: cc.Node = null;

    mainAtlas: cc.SpriteAtlas = null;

    NUMBER_MAX_ITEM = 6;
    HEIGHT_CONTENT_REAL_MODE = 220;
    HEIGHT_CONTENT_TRIAL_MODE = 180;
    gameId: number;

    setHeightContent(isTrialMode: boolean) {
        const scrollViewNode = this.scrollView.node;
        const mask = this.maskNode.getComponent(cc.Mask);
        if (isTrialMode) {
            scrollViewNode.height = this.HEIGHT_CONTENT_TRIAL_MODE;
            mask.spriteFrame = this.mainAtlas.getSpriteFrame("tumble-win-mask-trial");
        } else {
            scrollViewNode.height = this.HEIGHT_CONTENT_REAL_MODE;
            mask.spriteFrame = this.mainAtlas.getSpriteFrame("tumble-win-mask-real");
        }
    }

    getTumbleItemComp(tumbleNode: cc.Node) {
        const control = super.getTumbleItemComp(tumbleNode);
        control.mainAtlas = this.mainAtlas;
        return control;
    }
}
