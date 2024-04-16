import { DerivedScoreboardPoint } from "sc-scoreboards";
import BaccaratBigRoad from "../../../../_baccarat/view-models/BaccaratBigRoad";
import BlockchainBaccaratDerivedScoreboardItem from "./BlockchainBaccaratDerivedScoreboardItem";
const { ccclass, property } = cc._decorator;

@ccclass
export default class BlockchainBaccaratDerivedScoreboard extends BaccaratBigRoad {
    @property(cc.String)
    nameBoard = "";

    private data: DerivedScoreboardPoint[][] = [];

    public renderNextNode() {
        if (this.isRenderedNext || this.data.length < 1) {
            return;
        }

        const emptyIndex = this.data[0].findIndex((e) => e.status === undefined);
        let lastCol = 0;
        if (emptyIndex !== -1) {
            if (
                emptyIndex > 0 &&
                !this.content.children[Math.floor((emptyIndex - 1) / 2)]
                    .getComponent(BlockchainBaccaratDerivedScoreboardItem)
                    .isFilledColumn()
            ) {
                lastCol = Math.floor((emptyIndex - 1) / 2);
            } else {
                lastCol = Math.floor(emptyIndex / 2);
            }
        } else {
            lastCol = Math.floor(this.data[0].length / 2);
            if (this.data[0].length % 2 === 0 && lastCol > 0) {
                lastCol -= 1;
            }
        }
        if (this.content.children[lastCol].getComponent(BlockchainBaccaratDerivedScoreboardItem).isFilledColumn()) {
            lastCol += 1;
        }

        if (this.content.children[this.content.childrenCount - 1].getComponent(BlockchainBaccaratDerivedScoreboardItem).isFilledColumn()) {
            this.updateContentChild(1);
            lastCol = this.content.childrenCount - 1;
            this.container.getComponent(cc.ScrollView).scrollToRight();
        }

        const scoreBoardItem = this.content.children[lastCol].getComponent(BlockchainBaccaratDerivedScoreboardItem);
        scoreBoardItem.renderNextNode();
        this.isRenderedNext = true;
    }

    public renderScoreBoard(data: DerivedScoreboardPoint[][]): void {
        if (data.length === 0) {
            return;
        }
        this.data = data;
        const dataLength = data[0].length;
        if (dataLength === 0) {
            const scoreboardItem = this.content.children[0];
            scoreboardItem.getComponent(BlockchainBaccaratDerivedScoreboardItem).removeNextNode();
        }
        const contentLength = this.content.childrenCount;

        this.updateContentChild(Math.ceil(dataLength / 2) - contentLength);

        for (let column = 0; column < dataLength; column++) {
            const scoreboardItem = this.content.children[Math.floor(column / 2)];
            const scoreBoardItemWorker = scoreboardItem.getComponent(BlockchainBaccaratDerivedScoreboardItem);
            scoreBoardItemWorker.removeNextNode();
            for (let row = 0; row < 6; row++) {
                const bigRoadScoreBoardPoint = data[row][column];
                scoreBoardItemWorker.resetNode(bigRoadScoreBoardPoint);
                if (bigRoadScoreBoardPoint.status !== undefined) {
                    scoreBoardItemWorker.renderNode(bigRoadScoreBoardPoint);
                }
            }
        }

        this.container?.getComponent(cc.ScrollView)?.scrollToRight();
        this.isRenderedNext = false;
    }

    resetBoard() {
        this.isRenderedNext = false;
        this.data = [];
        this.updateContentChild(this.minColumn - this.content.childrenCount);
        for (let index = 0; index < this.content.childrenCount; index++) {
            this.content.children[index].getComponent(BlockchainBaccaratDerivedScoreboardItem).resetAll();
        }
    }
}
