import BlockchainBaccarat from "./BlockchainBaccarat";
import BlockchainBaccaratBetItem from "./BlockchainBaccaratBetItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BlockchainBetOptionsUI extends cc.Component {
    @property({ type: BlockchainBaccaratBetItem })
    betItems: BlockchainBaccaratBetItem[] = [];

    main: BlockchainBaccarat;

    initBetOptions(main: BlockchainBaccarat) {
        this.main = main;
        main.betItems = this.betItems;
    }

    onBetClick(event) {
        this.main.onBetItemClick(event);
    }
}
