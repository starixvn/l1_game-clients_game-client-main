import _ = require("lodash");
import { i18n } from "../../ClientModules";
import { numberWithCommas } from "../../common/helpers/NumberHelper";
import { userManager } from "../../common/user/UserManager";
import AnimationUtils from "../../common/utils/AnimationUtils";
import { GameConfigBase } from "../_base/view-models/GameConfigBase";
import { SoloBetModel, SoloBetState } from "../_solo_game/solo-bet-model";
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
// cc.macro.ENABLE_TRANSPARENT_CANVAS = true;
@ccclass
export default class RouletteS extends SoloGame {
    @property(RouletteWheel)
    wheel: RouletteWheel = null;

    @property(cc.Node)
    rouletteBetItemsContainer: cc.Node = null;

    @property(cc.Widget)
    tableWidget: cc.Widget = null;

    private rouletteBetItems: RouletteBetItem[] = [];

    private readonly TableWidgetRightShowWheel = -330;
    private readonly TableWidgetRightHideWheel = 0;

    private readonly BetChipsPositionShow = 0;
    private readonly BetChipsPositionHide = -300;

    private betChipsShowing = false;
    private chipFlyingStamp = 0;

    protected betChipContainer: cc.Node = null;

    constructor() {
        super();
        this.gameId = 134;
        this.setConfig(new RouletteSConfig());
    }

    onLoad() {
        this.initRouletteBetItems();
        this.hideWheel(false);
        super.onLoad();
    }

    initBetChipByLoader(node: cc.Node): void {
        super.initBetChipByLoader(node);
        this.betChipContainer = node.parent;
        this.hideBetChip();
    }

    hideBetChip() {
        this.betChipsShowing = false;
        this.betChipContainer.position = cc.v3(0, this.BetChipsPositionHide, 0);
    }

    showBetChip() {
        this.betChipsShowing = true;
        this.betChipContainer.position = cc.v3(0, this.BetChipsPositionShow, 0);
    }

    clickOpenBetChip() {
        if (this.betChipsShowing) {
            this.hideBetChip();
        } else {
            this.showBetChip();
        }
    }

    showWheel(animated = true) {
        if (!animated) {
            this.tableWidget.right = this.TableWidgetRightShowWheel;
            return Promise.resolve();
        }

        return new Promise<void>((resolve) => {
            this.tweenTableWidget(this.TableWidgetRightShowWheel, resolve);
        });
    }

    hideWheel(animated = true) {
        if (!animated) {
            this.tableWidget.right = this.TableWidgetRightHideWheel;
            return Promise.resolve();
        }
        return new Promise<void>((resolve) => {
            this.tweenTableWidget(this.TableWidgetRightHideWheel, resolve);
        });
    }

    tweenTableWidget(toRight: number, complete: () => void) {
        return cc
            .tween({ value: this.tableWidget.right })
            .to(
                0.5,
                { value: toRight },
                {
                    onUpdate: (target) => {
                        this.tableWidget.right = target.value;
                        this.tableWidget.updateAlignment();
                    },
                    easing: "easeSineOut"
                }
            )
            .call(complete)
            .start();
    }

    protected onChangedBetChip(bet: number) {
        super.onChangedBetChip(bet);
        console.log("onChangedBetChip", bet);
        this.soloBetModel.setCurrentBet(bet);
    }

    initRouletteBetItems() {
        this.rouletteBetItems = this.rouletteBetItemsContainer.getComponentsInChildren(RouletteBetItem);

        this.rouletteBetItems.forEach((item) => {
            item.betCallback = this.onRouletteBetClick.bind(this);
            item.resetUI();
        });
    }

    initGameDataEvents() {
        super.initGameDataEvents();
        this.emitterListener(this.gameData.betModel, SoloBetModel.Events.CHANGE_OWN_BET, () => (data) => {
            this.rouletteBetItems.forEach((item) => {
                const ownBet = data[item.node.name] ?? 0;
                item.setOwnBet(ownBet);
            });
        });
        this.emitterListener(this.gameData.betModel, SoloBetModel.Events.FLY_OWN_CHIP_FAKE, () => (data) => {
            if (data.endBet) {
                const choice = data.betChoice;
                const betItem = this.rouletteBetItems.find((item) => item.node.name === choice);
                this.chipFlyingStamp = Date.now();
                this.betChips.throwChipThenConvertToStack(betItem.chipNode, this.currentBet, () => {
                    this.mergeStackOnChoice(choice, this.chipFlyingStamp);
                });
            }
        });
        this.emitterListener(this.gameData.betModel, SoloBetModel.Events.CHANGE_OWN_CHIPS_FAKE, () => (ownBets) => {
            this.rouletteBetItems.forEach((item) => {
                const choice = item.node.name;
                const betValue = ownBets[choice];
                if (betValue) {
                    this.betChips.createChipStackUtils(item.chipNode, betValue);
                }
            });
        });
        this.emitterListener(this.gameData.betModel, SoloBetModel.Events.CHANGE_STATE, () => (state) => {
            this.onStateChange(state);
        });
    }

    mergeStackOnChoice(choice: string, timeStamp: number) {
        if (this.chipFlyingStamp !== timeStamp) {
            return;
        }

        const totalBet = this.soloBetModel.getTotalBetOnChoice(choice);
        const item = this.rouletteBetItems.find((item) => item.node.name === choice);
        this.betChips.createChipStackUtils(item.chipNode, totalBet);
    }

    updateOddsFromConfigs() {
        if (this.gameConfigs?.odds) {
            const odds = this.gameConfigs.odds;

            this.rouletteBetItems.forEach((item) => {
                const type = this.getTypeFromChoice(item.node.name);
                item.setOdd(odds[type]);
            });
        }
    }

    onStateChange(state: string) {
        switch (state) {
            case SoloBetState.READY:
                this.rouletteBetItems.forEach((item) => item.clearBet());
                break;
            case SoloBetState.BETTING:
                this.rouletteBetItems.forEach((item) => item.setHighlight(false));
                break;
            case SoloBetState.RESULT:
                break;
            case SoloBetState.SETTLEMENT:
                break;
            default:
                break;
        }
    }

    onRouletteBetClick(choice: string) {
        if (!this.checkAvailableBetChoices(choice, this.currentBet) || !this.checkAvailableBalance(this.currentBet)) {
            return;
        }

        this.soloBetModel.addBet(choice);
    }

    protected createBetData(bet: any) {
        const betChoices = this.generateBetChoices(bet);
        cc.log("betChoices --- ", betChoices);
        const betData = {
            betChoices,
            username: userManager.userName,
            clientSentTime: new Date()
        };
        return betData;
    }

    protected generateBetChoices(bet: any) {
        const betChoices = {};
        Object.keys(bet).forEach((choice) => {
            const type = this.getTypeFromChoice(choice);
            const typeValue = betChoices[type] || {};

            if (type === "column" || type === "dozen") {
                const subChoice = choice.slice(-1);
                typeValue[subChoice] = bet[choice];
            } else {
                typeValue[choice] = bet[choice];
            }
            betChoices[type] = typeValue;
        });
        return betChoices;
    }

    async showSettlementResult(settlement: any) {
        const result = settlement.result;
        try {
            await this.showWheel();
            await this.showWheelResult(result);
            this.wheel.hideResultNumber();
            this.gameData.settlement.finishShowResult(settlement, true);
        } catch (error) {
            console.warn(error.message);
        }
    }

    handleAfterSettlementResult(settlement: any, animated: boolean) {
        super.handleAfterSettlementResult(settlement, animated);
        this.rouletteBetItems.forEach((betItem) => {
            const choice = betItem.node.name;
            const type = this.getTypeFromChoice(choice);
            const isWin = settlement.settlementResult[type].includes(choice);
            betItem.setHighlight(isWin);
        });
    }

    showWheelResult(result: number) {
        return new Promise<void>((resolve) => {
            this.wheel.showResult(result, () => {
                AnimationUtils.delayTime(0.5).then(() => {
                    this.hideWheel().then(resolve);
                });
            });
        });
    }

    checkAvailableBalance(amount: number): boolean {
        const total = this.soloBetModel.currentTotalBet();
        const available = total + amount <= userManager.balance;

        !available && this.showMiniWarning(i18n.t("messages.notEnoughMoney"));
        return available;
    }

    getTypeFromChoice(choice: string): string {
        const dict = {
            split: [],
            street: [],
            triangle: [],
            corner: [],
            fourNumbers: [],
            line: [],
            column: ["column1", "column2", "column3"],
            dozen: ["dozen1", "dozen2", "dozen3"],
            redBlack: ["red", "black"],
            oddEven: ["odd", "even"],
            bigSmall: ["big", "small"]
        };

        const type = Object.keys(dict).find((type) => dict[type].includes(choice));

        if (type) {
            return type;
        }

        const numbers = choice.split(",");
        const length = numbers.length;

        if (length === 1) {
            return "straightUp";
        }
        if (length === 2) {
            return "split";
        }
        if (length === 3) {
            if (choice === "0,1,2" || choice === "0,2,3") {
                return "street";
            }
            return "triangle";
        }
        if (length === 4) {
            if (choice === "0,1,2,3") {
                return "fourNumbers";
            }
            return "corner";
        }

        return "line";
    }

    checkAvailableBetChoices(choice: string, amount: number): boolean {
        if (!this.gameConfigs) {
            return false;
        }

        const betModel = this.soloBetModel;
        const choiceAmount = betModel.currentChoiceAmount(choice);
        const newChoiceAmount = choiceAmount + amount;
        const type = this.getTypeFromChoice(choice);

        if (this.checkExceedMaxBetChoice(newChoiceAmount, type, false)) {
            return false;
        }

        const currentTotal = betModel.currentTotalBet();
        const newTotal = currentTotal + amount;
        if (this.checkExceedMaxBet(newTotal)) {
            return false;
        }

        return true;
    }

    checkExceedMaxBet(total: number): boolean {
        const maxBet = this.getMaxBet();
        if (total > maxBet) {
            this.showMiniWarning(i18n.t("messages.maxBetNotice", { maxBet: numberWithCommas(maxBet) }));
            return true;
        }
        return false;
    }

    checkExceedMaxBetChoice(amount: number, type: string, isMultiChoices: boolean): boolean {
        const maxBet = Math.min(this.gameConfigs.maxBetPerChoices[type], this.getMaxBet());
        const text = isMultiChoices
            ? i18n.t("messages.maxBetOfAnyChoiceReached")
            : i18n.t("messages.maxBetForChoiceNotice", {
                  maxBet: numberWithCommas(maxBet)
              });
        if (amount > maxBet) {
            this.showMiniWarning(text);
            return true;
        }

        return false;
    }

    clickReBet() {
        if (!this.checkAvailableBalance(0)) {
            return;
        }

        super.clickReBet();
    }
}
