import { TimeShowAnim } from "./../view-models/card-shuffle/BlockchainBaccaratCardsShuffle";
import { Blockchain } from "./../event-models/BlockchainBaccaratCardListModel";
import { clearPercentBet } from "../actions/BlockchainBaccaratBetPercentageAction";
import BlockchainBaccarat from "../view-models/BlockchainBaccarat";
import BlockchainBaccaratBetItem from "../view-models/BlockchainBaccaratBetItem";
import BaccaratTimeDataBaseHandler from "../../_baccarat/data-handler/BaccaratTimeDataBaseHandler";

export class BlockchainBaccaratTimeHandler extends BaccaratTimeDataBaseHandler {
    protected dealCardsTime = 4;
    private readonly durationNewShoe = 10;
    private readonly durationSettlement = 18;
    private readonly durationShowNewShoe = this.main.config.fullTimeNewShoe - (this.durationSettlement - this.dealCardsTime);
    private isNewShoe = false;
    private isShowShoe = false;
    private isResetUI = false;

    constructor(protected readonly main: BlockchainBaccarat) {
        super(main);
    }

    get isNotEnoughTimeFlyCard() {
        return (
            this.main.currentTimeRemaining > this.main.config.betTime &&
            this.main.currentTimeRemaining < this.main.config.betTime + this.dealCardsTime
        );
    }

    handle(data: any) {
        if (
            data.remainingTime &&
            data.remainingTime > this.main.config.fullTime &&
            data.remainingTime <= this.main.config.fullTimeNewShoe
        ) {
            this.isNewShoe = true;
        }
        super.handle(data);
    }

    gameUpdate(): void {
        if (this.isInWaitTime) {
            this.handleWaitTime();
        } else {
            if (this.isStartingNewGameRound && this.isShowShoe) {
                this.isShowShoe = false;
            }
            this.isNewShoe = false;
            const gameData = this.main.gameData;
            if (gameData.cardList.blockchain?.isNew) {
                gameData.cardList.blockchain.isNew = false;
            }
            this.main.cardsUI.isRunJoinRoom && (this.main.cardsUI.isRunJoinRoom = false);

            super.handleNotWaitTime();
        }

        this.main.currentTimeRemaining--;
    }

    handleWaitTime() {
        const gameData = this.main.gameData;
        if (this.isNewShoe && this.main.currentTimeRemaining <= this.durationShowNewShoe) {
            !this.isShowShoe && this.handleShowShuffleCards(gameData.cardList.newBlockchain, this.main.currentTimeRemaining);
        }

        if (gameData.cardList.blockchain?.isNew && !this.isShowShoe && this.isInWaitTime) {
            this.isNewShoe = true;
            this.handleShowShuffleCards(gameData.cardList.blockchain, this.main.currentTimeRemaining);
        }

        if (this.main.timeWaitNode) {
            !gameData.cardList.blockchain?.isNew && this.main.finishShowResult && this.showWaitTime();
        }

        this.showMainTime(false);
        this.main.showProcessingWarning(false);
        this.main.setGameRound(this.main.roundId - 1);
    }

    showWaitTime() {
        if (this.isNewShoe || this.main.gameData.cardList.blockchain.isNew) {
            this.main.timeWaitNode.active = false;
        } else {
            this.main.timeWaitNode.active = true;
        }

        this.main.timeWaitLabel.string = this.formatTime(
            this.main.currentTimeRemaining -
                this.main.config.betTime -
                this.dealCardsTime -
                1 -
                (this.isNewShoe || this.main.gameData.cardList.blockchain.isNew ? this.durationNewShoe : 0)
        );
    }

    async handleFlyCards() {
        const gameData = this.main.gameData;
        const cardContainer = this.main.cardsUI;

        const currentCardIndex = gameData.cardList.currentIndex;
        const numberCardsFlied = gameData.cardList.numberCardsFly;

        if (this.isResetUI) {
            cardContainer.setActiveCardsUI(true);
            this.main.handleShowGameId(true);
        }

        this.main.setGameRound(this.main.roundId);

        await cardContainer.collectCardsOnTable(this.isResetUI);
        cardContainer.updateCardDropBox(currentCardIndex, gameData.cardList.blockchain?.cutCardIndex);
        const lastRound = gameData.finishModel.finishData ?? gameData.roundHistory.list[0];
        this.main.lastRoundIfo.updateUI(lastRound, currentCardIndex);
        clearPercentBet(this.main.betItems as BlockchainBaccaratBetItem[]);
        await cardContainer.handleFlyCards(currentCardIndex, numberCardsFlied);
        this.isResetUI = false;
    }

    handleInLockBetTime() {
        const main = this.getOwnMain();
        main.scoreboard?.renderNextNode();
        this.main.betItems.forEach((item) => item.setHighlight(false));
    }

    handleShowShuffleCards(blockchainData: Blockchain, timeRemaining: number) {
        if (blockchainData) {
            const isNew = blockchainData?.isNew ?? false;
            this.isShowShoe = true;
            this.isResetUI = true;
            this.main.resetDataAndUI();
            this.main.scoreboard.resetScoreboard();
            this.main.lastRoundIfo.reset();
            this.main.gameData.finishModel.clear();
            clearPercentBet(this.main.betItems as BlockchainBaccaratBetItem[]);
            const cardContainer = this.main.cardsUI;
            blockchainData?.isNew && (blockchainData.isNew = false);

            cardContainer.handleShuffleCards(blockchainData, timeRemaining, this.checkShowAllCards(timeRemaining, isNew), () => {
                this.main.handleShowGameId(false);
            });
        }
    }

    checkShowAllCards(timeRemaining: number, isNewShoe = true) {
        if (timeRemaining >= TimeShowAnim.burnCard && !isNewShoe) {
            return true;
        }

        return false;
    }
}
