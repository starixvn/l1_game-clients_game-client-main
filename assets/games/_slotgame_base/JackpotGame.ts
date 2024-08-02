import AnimatedTime from "../../common/animated-time/view-models/AnimatedTime";
import GameUtils from "../../common/GameUtils";
import { ClassicSlotSound } from "./ClassicSlotSound";
import JackpotGameItem from "./JackpotGameItem";
import JackpotWinningAmount from "./JackpotWinningAmount";
import { SlotGameBaseConfigs } from "./SlotGameBaseConfigs";

const { ccclass, property } = cc._decorator;

interface IWinningJackpot {
    winnerName: string;
    prize: string;
    amount: number;
}
@ccclass
export default class JackpotGame extends cc.Component {
    @property(cc.Node)
    content: cc.Node = null;

    @property(AnimatedTime)
    timer: AnimatedTime = null;

    @property(cc.Node)
    winningNode: cc.Node = null;

    @property(cc.Prefab)
    jackpotItem: cc.Prefab = null;

    protected _gameId;
    public set gameId(value: number) {
        this._gameId = value;
        this.initBonusItems();
    }
    public get gameId(): number {
        return this._gameId;
    }

    items: JackpotGameItem[] = [];
    jackpotWinningAmountPrefab: cc.Prefab = null;

    public onJackpotGameFinished = () => {};
    public onItemClicked = (index: number) => {};
    public slotGameConfigs: SlotGameBaseConfigs;

    private jackpotWinningPool: JackpotWinningAmount;
    private timerTween: cc.Tween;
    prizes = 0;
    public playSoundCallback = (type: ClassicSlotSound) => {};

    initBonusItems() {
        this.createBonusItems();
        this.content.children.forEach((child, index) => {
            const item = child.getComponent(JackpotGameItem);
            item && this.items.push(item);

            child.on("click", () => {
                this.playSoundCallback(ClassicSlotSound.CLICK);
                this.playJackpotItemSound();
                this.onItemClicked(index);
                item.open();
                this.items.forEach((item) => {
                    const button = item.getComponent(cc.Button);
                    button.interactable = false;
                });
            });
        });
    }

    playJackpotItemSound() {
        this.playSoundCallback(ClassicSlotSound.BONUS_ITEM);
    }

    createBonusItems() {
        if (!this.jackpotItem) {
            return;
        }

        this.content.destroyAllChildren();

        for (let i = 0; i < this.prizes; i++) {
            const item = cc.instantiate(this.jackpotItem);
            item.name = `jackpot-${i}`;
            this.content.addChild(item);
        }
    }

    async openJackpot(data: IWinningJackpot) {
        const delayTime = 1;
        await GameUtils.delayTime(delayTime);
        this.initJackpotWinningAmount(data, delayTime);
        this.checkFinishJackpot();
    }

    async initJackpotWinningAmount(data: IWinningJackpot, delayTime: number) {
        if (!this.jackpotWinningAmountPrefab) {
            return;
        }

        const winningAmount = cc.instantiate(this.jackpotWinningAmountPrefab);
        this.winningNode.addChild(winningAmount);

        const { amount, prize } = data;
        this.jackpotWinningPool = winningAmount.getComponent(JackpotWinningAmount);

        this.jackpotWinningPool.setAmount({ amount: amount, duration: this.slotGameConfigs.showJackpotWinningAmountDuration - delayTime });
        this.jackpotWinningPool.loadPoolSprite(this.gameId, prize);
    }

    hideTimer() {
        this.timer.node.active = false;
        this.timerTween.stop();
    }

    showJackpotWin() {
        this.playSoundCallback(ClassicSlotSound.BONUS_TOTAL);
        this.hideTimer();
        this.winningNode.active = true;
    }

    async checkFinishJackpot() {
        this.showJackpotWin();
        await GameUtils.delayTime(this.slotGameConfigs.showJackpotWinningAmountDuration);
        this.onJackpotGameFinished();
        this.node.destroy();
    }

    start() {
        const duration = this.slotGameConfigs.jackpotTimeOut;
        this.timerTween = GameUtils.initSlotCountDownTimer(this.timer, duration, this.hideTimer);
    }
}
