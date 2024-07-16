import AnimatedTime from "../../common/animated-time/view-models/AnimatedTime";
import GameUtils from "../../common/GameUtils";
import { ClassicSlotSound } from "./ClassicSlotSound";
import JackpotGameItem from "./JackpotGameItem";
import JackpotWinningAmount from "./JackpotWinningAmount";
import { SlotGameBaseConfigs } from "./SlotGameBaseConfigs";

const { ccclass, property } = cc._decorator;

interface IWinningJackpot {
    winnerName: string;
    pool: string;
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
                this.items.map((item) => {
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

    openJackpot(data: IWinningJackpot) {
        this.initJackpotWinningAmount(data);
        this.checkFinishJackpot();
    }

    async initJackpotWinningAmount(data: IWinningJackpot) {
        if (!this.jackpotWinningAmountPrefab) {
            return;
        }

        const winningAmount = cc.instantiate(this.jackpotWinningAmountPrefab);
        this.winningNode.addChild(winningAmount);

        const { amount, pool } = data;
        const jackpotWinningPool = winningAmount.getComponent(JackpotWinningAmount);

        jackpotWinningPool.setAmount({ amount: amount, duration: this.slotGameConfigs.showJackpotWinningAmountDuration });
        jackpotWinningPool.loadPoolSprite(this.gameId, pool);
    }

    hideTimer() {
        this.timer.node.active = false;
        this.timerTween.stop();
    }

    showWinningAmount() {
        this.playSoundCallback(ClassicSlotSound.BONUS_TOTAL);
        this.hideTimer();
        this.winningNode.active = true;
    }

    checkFinishJackpot() {
        const delayTime = 1;
        cc.tween(this)
            .delay(delayTime)
            .call(() => this.showWinningAmount())
            .delay(this.showJackpotWinTime(delayTime))
            .call(() => {
                this.onJackpotGameFinished();
                this.node.destroy();
            })
            .start();
    }

    showJackpotWinTime(delayTime: number): number {
        if (!this.slotGameConfigs) {
            return 0;
        }

        return this.slotGameConfigs.showJackpotWinningAmountDuration - delayTime;
    }

    start() {
        const duration = this.slotGameConfigs.jackpotTimeOut;
        this.timerTween = GameUtils.initSlotCountDownTimer(this.timer, duration, this.hideTimer);
    }
}
