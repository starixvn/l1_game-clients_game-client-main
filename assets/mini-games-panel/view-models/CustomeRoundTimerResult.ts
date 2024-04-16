import GameUtils from "../../common/GameUtils";
import { GameRoundTimerData } from "./RoundTimerData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CustomeRoundTimerResult extends cc.Component {
    show(data: GameRoundTimerData) {
        if (!data.settlementResult) {
            return;
        }

        const winningChoice = this.showWinningChoice(data.settlementResult);
        this.playAnimation(winningChoice);
    }

    private showWinningChoice(settlementResult): cc.Node {
        let winningChoice: cc.Node;
        this.node.children.forEach((choice) => {
            if (settlementResult[choice.name]) {
                choice.active = true;
                winningChoice = choice;
            } else {
                choice.active = false;
            }
        });

        return winningChoice;
    }

    protected async playAnimation(node: cc.Node) {
        if (!this.node.isValid) {
            return;
        }

        const skeleton = node.getComponent(sp.Skeleton);
        if (!skeleton) {
            return;
        }
        skeleton.setAnimation(0, "show", false);
        const showDelayTime = skeleton.findAnimation("show")?.duration || 0;
        await GameUtils.delayTime(showDelayTime);
        skeleton.setAnimation(0, "idle", true);
    }
}
