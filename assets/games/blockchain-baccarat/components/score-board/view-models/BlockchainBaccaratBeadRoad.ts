import { lodash } from "../../../../../ClientModules";
import AudioManager from "../../../../../common/audio/AudioManager";
import { BasicHistoryData } from "../../../../_base/view-models/BasicHistoryBoard";
import { BlockchainBaccaratRoundHistory } from "../../../event-models/BlockchainBaccaratModel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BlockchainBaccaratBeadRoad extends cc.Component {
    @property(cc.Node)
    content: cc.Node = null;

    @property(cc.Prefab)
    beadRoadItem: cc.Prefab = null;

    private readonly childrenItemKey = {
        symbol: "symbol",
        number: "number",
        value: "value",
        playerPair: "playerPair",
        bankerPair: "bankerPair"
    };
    private readonly maxItems = 60;

    private isSymbolMode = true;
    private items = null;
    private dots: cc.Node[] = [];
    private isRenderNext = false;

    onLoad(): void {
        const itemsNode = cc.instantiate(this.beadRoadItem);
        this.items = itemsNode.children;
    }

    render(roundHistory: BlockchainBaccaratRoundHistory[]) {
        while (roundHistory.length > this.maxItems) {
            roundHistory.pop();
        }
        roundHistory.reverse();
        roundHistory.forEach((history) => {
            this.addNewItem(history);
        });
    }

    addNewItem(lastRound: BlockchainBaccaratRoundHistory) {
        const round = this.convertToBasicHistoryData(lastRound);
        if (this.isRenderNext) {
            this.dots[this.dots.length - 1].removeFromParent();
            this.dots[this.dots.length - 1].destroy();
            this.dots.pop();
            this.isRenderNext = false;
        }
        const node = lodash.find(this.items, (item) => item.name.toLowerCase() === round.name);
        const dot = cc.instantiate(node);
        dot.active = true;
        dot.getChildByName(this.childrenItemKey.value).getComponent(cc.Label).string = round.value;
        dot.getChildByName(this.childrenItemKey.symbol).active = this.isSymbolMode;
        dot.getChildByName(this.childrenItemKey.number).active = !this.isSymbolMode;
        dot.getChildByName(this.childrenItemKey.value).active = !this.isSymbolMode;
        dot.getChildByName(this.childrenItemKey.playerPair).active = round.playerPair;
        dot.getChildByName(this.childrenItemKey.bankerPair).active = round.bankerPair;
        this.content.addChild(dot);
        this.dots.push(dot);
    }

    addNextNode() {
        if (this.isRenderNext) {
            return;
        }
        while (this.dots.length > this.maxItems - 1) {
            this.dots[0].removeFromParent();
            this.dots[0].destroy();
            this.dots.shift();
        }
        this.isRenderNext = true;
        const node = lodash.find(this.items, (item) => item.name.toLowerCase() === "next");
        const dot = cc.instantiate(node);
        dot.active = true;
        this.content.addChild(dot);
        this.dots.push(dot);
    }

    resetBoard() {
        this.dots.forEach((dot) => {
            dot.removeFromParent();
            dot.destroy();
        });
        this.dots = [];
        this.isRenderNext = false;
    }

    changeMode() {
        AudioManager.getInstance().playClick();
        this.isSymbolMode = !this.isSymbolMode;
        this.dots.forEach((dot) => {
            if (dot.childrenCount > 0) {
                dot.getChildByName(this.childrenItemKey.symbol).active = this.isSymbolMode;
                dot.getChildByName(this.childrenItemKey.number).active = !this.isSymbolMode;
                dot.getChildByName(this.childrenItemKey.value).active = !this.isSymbolMode;
            }
        });
    }

    private convertToBasicHistoryData(round: BlockchainBaccaratRoundHistory) {
        const result = round.result;
        const settlementResult = round.settlementResult;
        if (settlementResult?.player) {
            return new BasicHistoryData(
                "player",
                this.calculateTotalScore(result.player),
                settlementResult.playerPair,
                settlementResult.bankerPair
            );
        } else {
            if (settlementResult?.banker) {
                return new BasicHistoryData(
                    "banker",
                    this.calculateTotalScore(result.banker),
                    settlementResult.playerPair,
                    settlementResult.bankerPair
                );
            } else {
                return new BasicHistoryData(
                    "tie",
                    this.calculateTotalScore(result.player),
                    settlementResult.playerPair,
                    settlementResult.bankerPair
                );
            }
        }
    }

    private calculateTotalScore(hand) {
        let value = 0;
        value += this.getValueCard(hand.card1);
        value += this.getValueCard(hand.card2);
        value += this.getValueCard(hand.card3);
        return (value % 10).toString();
    }

    private getValueCard(card) {
        const value = card?.rank + 1;
        return value > 10 || !value ? 0 : value;
    }
}
