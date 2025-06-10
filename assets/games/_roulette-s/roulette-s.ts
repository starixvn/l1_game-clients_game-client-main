import { userManager } from "../../common/user/UserManager";
import { GameConfigBase } from "../_base/view-models/GameConfigBase";
import { SoloBetModel } from "../_solo_game/solo-bet-model";
import SoloGame from "../_solo_game/solo-game";
import RouletteWheel from "../roulette/view-models/RouletteWheel";
import RouletteBetItem from "./scripts/roulette-bet-item";

const { ccclass, property } = cc._decorator;

export class RouletteSConfig implements GameConfigBase {
    minBetTime = 1;
    fullTime = 59;
    betTime = 45;
    stopBetTime = 5;
    waitTime = 15;
}

@ccclass
export default class RouletteS extends SoloGame {
    @property(RouletteWheel)
    wheel: RouletteWheel = null;

    @property(cc.Node)
    rouletteBetItemsContainer: cc.Node = null;

    private rouletteBetItems: RouletteBetItem[] = [];

    constructor() {
        super();
        this.gameId = 134;
        this.setConfig(new RouletteSConfig());
    }

    onLoad() {
        this.initRouletteBetItems();
        super.onLoad();
    }

    protected onChangedBetChip(bet: number) {
        super.onChangedBetChip(bet);
        console.log("onChangedBetChip", bet);
        (this.gameData.betModel as SoloBetModel).setCurrentBet(bet);
    }

    initRouletteBetItems() {
        this.rouletteBetItems = this.rouletteBetItemsContainer.getComponentsInChildren(RouletteBetItem);

        this.rouletteBetItems.forEach((item) => {
            item.betCallback = this.onRouletteBetClick.bind(this);
        });
    }

    onRouletteBetClick(choice: string) {
        (this.gameData.betModel as SoloBetModel).addBet(choice);
    }

    protected createBetData(bet: any) {
        const betChoices = {
            oddEven: { odd: 100 },
            redBlack: { red: 100 }
        };
        const betData = {
            betChoices,
            username: userManager.userName,
            clientSentTime: new Date()
        };
        return betData;
    }

    async showSettlementResult(settlement: any) {
        const result = settlement.result;
        await this.showWheelResult(result);
        try {
            this.gameData.settlement.finishShowResult(settlement, true);
        } catch (error) {
            console.warn(error.message);
        }
    }

    showWheelResult(result: number) {
        return new Promise<void>((resolve) => {
            this.wheel.showResult(result, resolve);
        });
    }
}
