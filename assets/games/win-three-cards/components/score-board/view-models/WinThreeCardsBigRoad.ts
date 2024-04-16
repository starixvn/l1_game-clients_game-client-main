import BaccaratBigRoad from "../../../../_baccarat/view-models/BaccaratBigRoad";
import WinThreeCardsBigRoadItem from "./WinThreeCardsBigRoadItem";
import { scoreBoard } from "../../../../../ClientModules";
import { WinThreeCardsSettlementResult } from "../../../view-models/WinThreeCardsModel";
import { Choices } from "../../../view-models/WinThreeCardsConstant";
const { ccclass } = cc._decorator;

class WinThreeCardsConverter extends scoreBoard.Converter<WinThreeCardsSettlementResult> {
    positiveKey() {
        return Choices.dragon;
    }
}

@ccclass
export default class WinThreeCardsBigRoad extends BaccaratBigRoad {
    initialBigRoad = (): any => {
        const converter = new WinThreeCardsConverter();

        return new scoreBoard.BigRoadScoreboard({ height: 6, converter });
    };

    getComponentItem(node: cc.Node): any {
        return node.getComponent(WinThreeCardsBigRoadItem);
    }

    public renderScoreBoardInGame(data: any[]) {
        this.firstRender = false;
        this.isRenderedNext = false;
        super.renderScoreBoardInGame(data);
    }
}
