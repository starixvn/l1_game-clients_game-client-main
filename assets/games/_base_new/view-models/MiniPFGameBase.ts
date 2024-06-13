import { InGameMenuEvents } from "../../../common/in-game-menu/InGameMenu";
import MiniGameBase from "./MiniGameBase";

export default class MiniPFGameBase extends MiniGameBase {
    onClickProvablyFair() {
        this.node.emit(InGameMenuEvents.OPEN_PROVABLY_FAIR);
    }

    openProvablyFair() {
        this.provablyFairComponent.onShow();
        this.provablyFairComponent.updateGameId(this.gameId);
    }
}
