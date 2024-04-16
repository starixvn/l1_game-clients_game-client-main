import GameRoomBaseBetHandler from "../../../_base/handlers/GameRoomBaseBetHandler";
import WinThreeCards from "../WinThreeCards";
export default class WinThreeCardsBetHandler extends GameRoomBaseBetHandler {
    constructor(protected readonly main: WinThreeCards) {
        super(main);
    }
}
