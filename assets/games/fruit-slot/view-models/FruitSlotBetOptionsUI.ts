import AudioManager from "../../../common/audio/AudioManager";
import { setBgVisibility } from "../actions/FruitSlotWinningAction";
import FruitSlot from "./FruitSlot";
import FruitSlotBetItem from "./FruitSlotBetItem";
import FruitSlotLedLightItem from "./FruitSlotLedLightItem";
import FruitSlotSpinItem from "./FruitSlotSpinItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FruitSlotBetOptionsUI extends cc.Component {
    @property({ type: FruitSlotBetItem })
    betItems: FruitSlotBetItem[] = [];

    @property({ type: FruitSlotSpinItem })
    spinItems: FruitSlotSpinItem[] = [];

    @property(cc.Animation)
    bettingAnimation: cc.Animation = null;

    @property(cc.Label)
    bigSmallResult: cc.Label = null;

    @property(cc.Node)
    bigSmallResultBackground: cc.Node = null;

    @property(cc.Node)
    bgLockSpin: cc.Node = null;

    @property(cc.Node)
    ledZone: cc.Node = null;

    main: FruitSlot;
    ledSpin: FruitSlotLedLightItem = null;

    @property(cc.AudioSource)
    singleChipAudio: cc.AudioSource = null;

    @property(cc.AudioSource)
    spinAudio: cc.AudioSource = null;

    @property(cc.AudioSource)
    winAudio: cc.AudioSource = null;

    initBetOptions(main: FruitSlot) {
        this.main = main;
        main.betItems = this.betItems;
        main.spinItems = this.spinItems;
    }

    onBetClick(event) {
        this.main.onBetItemClick(event);
    }

    playBettingAnim(play: boolean) {
        if (this.bettingAnimation) {
            this.bettingAnimation.node.active = play;
        }
    }

    updateBigSmallResultBackground(opacity: number) {
        this.bigSmallResultBackground.opacity = opacity;
    }

    resetUIBettingZone() {
        this.bigSmallResult.string = "";
        this.updateBigSmallResultBackground(0);
        this.playBettingAnim(true);
        this.betItems?.forEach((item) => {
            item.node.opacity = 255;
            item?.resetHighlight();
            cc.tween(item?.startRoundAnim)
                .call(() => {
                    item.startRoundAnim.setAnimation(0, "nextround_normal", true);
                    item.startRoundAnim.node.active = true;
                })
                .delay(0.5)
                .call(() => (item.startRoundAnim.node.active = false))
                .start();
        });

        this.spinItems.forEach((item) => item?.resetHighlight());
        setBgVisibility(this.bgLockSpin, true);
    }

    playSingleChipsSound(isLoginUserPlaceBet = false) {
        isLoginUserPlaceBet && AudioManager.getInstance().playSFX(this.singleChipAudio.clip);
    }

    playWinSound() {
        if (this.winAudio) {
            AudioManager.getInstance().playSFX(this.winAudio.clip);
        }
    }    
}
