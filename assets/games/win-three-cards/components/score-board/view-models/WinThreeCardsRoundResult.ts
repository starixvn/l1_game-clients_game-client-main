import { WinThreeCardsResultCards, WinThreeCardsSettlementResult } from "../../../view-models/WinThreeCardsModel";
import { StringHelper, changeCacheMode, convertRank, getCardsResult } from "../../../view-models/WinThreeCardsHelper";
import { hedgeBetChoices } from "../../../view-models/WinThreeCardsConstant";
const { ccclass, property } = cc._decorator;

enum OrderNode {
    dragon = 0,
    phoenix
}
@ccclass
export default class WinThreeCardsRoundResult extends cc.Component {
    @property(cc.Node)
    backgroundNode: cc.Node[] = [];

    @property(cc.Label)
    textLabel: cc.Label[] = [];

    changeColorText(settlementResult: WinThreeCardsSettlementResult) {
        const color = cc.Color.WHITE;
        if (settlementResult.dragon || settlementResult.phoenix) {
            this.textLabel.forEach((label) => {
                label.node.color = color;
            });
        }

        if (!settlementResult.dragon) {
            this.textLabel[OrderNode.dragon].node.color = color.fromHEX(StringHelper.dragonSettlementColor);
        }

        if (!settlementResult.phoenix) {
            this.textLabel[OrderNode.phoenix].node.color = color.fromHEX(StringHelper.phoenixSettlementColor);
        }
    }

    changeBackgroundColor(settlementResult: WinThreeCardsSettlementResult) {
        hedgeBetChoices.forEach((name: string, index: number) => {
            this.backgroundNode[index].active = settlementResult[name];
        });
    }

    changeValueText(result: WinThreeCardsResultCards) {
        hedgeBetChoices.forEach((name: string, index: number) => {
            this.textLabel[index].string = `${getCardsResult(result[name].handRankId)} ${convertRank(+result[name].cardRankId)}`;
            changeCacheMode(this.textLabel[index]);
        });
    }
}
