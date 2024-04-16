import AudioManager from "../../../common/audio/AudioManager";
import FruitSlotSymbolSpineAnimation from "./FruitSlotSymbolSpineAnimation";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FruitSlotSpinItem extends cc.Component {
    @property(cc.Node)
    highlight: cc.Node = null;

    @property(cc.Node)
    symbolSpineAnim: cc.Node = null;

    @property(cc.AudioSource)
    spinAudio: cc.AudioSource = null;

    public setHighlightItems(highlight: boolean, isRepeatAnim: boolean, isAnimated = true) {
        if (this.highlight) {
            this.highlight.opacity = highlight && isAnimated ? 255 : 0;
            if (highlight && isAnimated) {
                const isRepeat = isRepeatAnim ? 30 : 1;
                cc.tween(this.highlight)
                    .repeat(isRepeat, cc.tween().to(0.05, { opacity: 255 }).delay(0.05).to(0.05, { opacity: 0 }))
                    .start();
            }
        }
    }

    public setHighlightSpinItem(highlight: boolean) {
        if (this.highlight) {
            this.highlight.opacity = highlight ? 255 : 0;
        }
    }

    public playSpineSymbolAnimation() {
        if (this.symbolSpineAnim) {
            this.symbolSpineAnim.getComponent(FruitSlotSymbolSpineAnimation).playAnimSymbol(true);
            this.symbolSpineAnim.getComponent(FruitSlotSymbolSpineAnimation).highlightSymbol(true);
        }
    }

    public playSpinSound() {
        if (this.spinAudio) {
            AudioManager.getInstance().playSFX(this.spinAudio.clip);
        }
    }

    public resetHighlight() {
        this.highlight && (this.highlight.opacity = 0);
        this.symbolSpineAnim.getComponent(FruitSlotSymbolSpineAnimation).playAnimSymbol(false);
        this.symbolSpineAnim.getComponent(FruitSlotSymbolSpineAnimation).highlightSymbol(false);
    }
}
