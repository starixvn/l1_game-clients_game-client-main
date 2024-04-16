import { lodash } from "../../../../ClientModules";
import FantanBowlAnimation from "../../scripts/FantanBowlAnimation";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Demo extends cc.Component {
    @property(FantanBowlAnimation)
    animation: FantanBowlAnimation = null;

    Restart() {
        this.animation.playShakingAnimation();
    }

    StartRound() {
        this.animation.startRound();
    }

    CloseRound() {
        this.animation.setNumberOfSeed(lodash.random(29, 40));
        this.animation.closeRound();
    }

    Finished() {
        this.animation.showStaticResult(lodash.random(29, 40));
    }
}
