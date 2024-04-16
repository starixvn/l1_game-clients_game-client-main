import { i18n } from "../../../ClientModules";
import { getLowercaseObjectKeys } from "../../../common/helpers/ObjectHelper";
import BlockchainBaccaratCardsUI from "../view-models/BlockchainBaccaratCardsUI";
import BlockchainBetOptionsUI from "../view-models/BlockchainBetOptionsUI";
import { BaccaratSettlementResult } from "./../../baccarat/view-models/event-models/BaccaratSettlementResult";

export const showLabelWinning =
    (betOptionsUI: BlockchainBetOptionsUI, cardsUI: BlockchainBaccaratCardsUI) =>
    (resultData: BaccaratSettlementResult, isAnimated = true) => {
        const winNoticeNode = cardsUI.winningNotice.node.parent;
        const keys = getLowercaseObjectKeys(resultData);
        let key = "tie_win";
        betOptionsUI?.betItems.forEach((item) => item.setHighlight(resultData[keys[item.node.name.toLowerCase()]], isAnimated));

        if (resultData.banker) {
            key = "banker_win";
        } else if (resultData.player) {
            key = "player_win";
        }
        cardsUI.winningNotice.string = i18n.t(`ui.${key}`).toUpperCase();
        winNoticeNode.active = true;
    };

export const showHighLightBet =
    (betOptionsUI: BlockchainBetOptionsUI) =>
    (resultData: BaccaratSettlementResult, isAnimated = true) => {
        const keys = getLowercaseObjectKeys(resultData);
        betOptionsUI?.betItems.forEach((item) => item.setHighlight(resultData[keys[item.node.name.toLowerCase()]], isAnimated));
    };
