import { i18n } from "../../../../../ClientModules";
import TutorialItem from "../../../../../common/tutorial/TutorialItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BlockchainBaccaratGuideItem extends TutorialItem {
    @property([cc.RichText])
    nodesRichText: cc.RichText[] = [];

    @property([cc.String])
    keys = [];

    protected anims: cc.AnimationState[] = [];

    hide() {
        this.anims.forEach((anim) => {
            anim.stop();
        });
        super.hide();
    }

    show() {
        const animComp = this.node.getComponent(cc.Animation);
        const clips = animComp.getClips();
        const firstAnim = animComp.play(clips[0].name);
        this.anims.push(firstAnim);
        this.nodesRichText.forEach((node, index) => {
            node.string = i18n.t(this.keys[index]);
        });
        super.show();
    }
}
