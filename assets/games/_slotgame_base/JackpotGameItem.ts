import GameUtils from "../../common/GameUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class JackpotGameItem extends cc.Component {
    @property(sp.Skeleton)
    openChestSkeleton: sp.Skeleton = null;

    open() {
        this.openChestSkeleton.setAnimation(0, "open", false);
        GameUtils.delayTime(0.5);
    }
}
