import { i18n } from "../../../../../ClientModules";
import GameUtils from "../../../../../common/GameUtils";
import { CardModel } from "../../../BlockchainBaccaratType";
import BlockchainBlinkHighLight from "./BlockchainBlinkHighLight";
import BlockchainCard from "./BlockchainCard";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BlockchainCardVerificationItem extends cc.Component {
    @property({ type: cc.Prefab })
    cardPrefab: cc.Prefab = null;

    @property(cc.RichText)
    rawValue: cc.RichText = null;

    @property(cc.Label)
    hashValue: cc.Label = null;

    @property(cc.Node)
    highlightSuccess: cc.Node = null;

    @property(cc.Node)
    highlightFailed: cc.Node = null;

    @property(cc.Button)
    copyButton: cc.Button = null;

    @property(cc.Node)
    hintCopyNode: cc.Node = null;

    @property(cc.Button)
    changeCard: cc.Button = null;

    @property(cc.Label)
    numberKey: cc.Label = null;

    @property(cc.Node)
    card: cc.Node = null;

    @property(cc.Node)
    tooltipNode: cc.Node = null;

    private textCopy: string = null;
    private readonly color = cc.Color.WHITE;

    resetHighLight() {
        this.highlightSuccess.active = this.highlightFailed.active = false;
    }

    onCopy() {
        const hintLabel = this.hintCopyNode.getChildByName("content").getComponent(cc.Label);
        hintLabel.string = i18n.t("messages.copy_success");
        GameUtils.copyToClipboard(this.textCopy, hintLabel, this.showHintCopy());
    }

    setHashValue(text: string) {
        this.hashValue.string = text;
        this.hashValue.node.color = this.color.fromHEX("#98b2e5");
        this.setTextCopy(text);
    }

    setRawValue(text: string) {
        this.rawValue.string = text;
    }

    setHighLightSuccess() {
        this.highlightSuccess.active = true;
        this.hashValue.node.color = this.color.fromHEX("#59c467");
        this.highlightSuccess.addComponent(BlockchainBlinkHighLight);
    }

    setHighLightFailed() {
        this.highlightFailed.active = true;
        this.hashValue.node.color = this.color.fromHEX("#ff6161");
        this.highlightFailed.addComponent(BlockchainBlinkHighLight);
    }

    showHintCopy() {
        cc.tween(this.hintCopyNode).to(0.2, { opacity: 255 }).delay(1).to(0.1, { opacity: 0 }).start();
    }

    showTooltip(content) {
        if (this.tooltipNode.opacity === 255) {
            this.hideTooltip();
        } else {
            const tooltip = this.tooltipNode.getChildByName("content").getComponent(cc.Label);
            tooltip.string = content;
            cc.tween(this.tooltipNode).to(0.2, { opacity: 255 }).start();
        }
    }

    hideTooltip() {
        cc.tween(this.tooltipNode).to(0.2, { opacity: 0 }).start();
    }

    setTextCopy(text: string) {
        this.textCopy = text;
    }

    enableCopyButton(enabled: boolean) {
        this.copyButton.interactable = enabled;
        this.copyButton.node.getChildByName("btn-active").active = enabled;
        this.copyButton.node.getChildByName("btn-disable").active = !enabled;
    }

    setNumberKey(number: number) {
        this.numberKey.string = (number + 1).toString().padStart(3, "0");
    }

    renderCard(card: CardModel, index: number) {
        this.card.addChild(this.createCard(card));
        this.setNumberKey(index);
    }

    public createCard(card: CardModel, isFaceUp = true): cc.Node {
        const node = GameUtils.createNodeFromPrefab(this.cardPrefab);
        const cardComponent = node.getComponent(BlockchainCard);
        cardComponent.setCardOldStyle({
            rank: card?.rank,
            suit: card?.suit
        });

        !!card ? cardComponent.setFaceUp(isFaceUp) : cardComponent.setFaceUp(!isFaceUp);
        cardComponent.setInfoTag();
        cardComponent.setShadow();
        cardComponent.resetIndexNumber();
        cardComponent.openCardVerification = () => {};
        return node;
    }
}
