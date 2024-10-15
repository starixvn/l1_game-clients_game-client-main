const { ccclass, property } = cc._decorator;

@ccclass
export default class SevenUpDownRoundResult extends cc.Component {
    @property(cc.Sprite)
    dice1: cc.Sprite = null;

    @property(cc.Sprite)
    dice2: cc.Sprite = null;

    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;

    @property(cc.Sprite)
    total: cc.Sprite = null;

    @property(cc.Sprite)
    result: cc.Sprite = null;

    @property(cc.Sprite)
    highlight: cc.Sprite = null;

    onLoad() {
        cc.tween(this.highlight.node)
            .repeatForever(
                cc.tween().to(0.4, { opacity: 150 }, { easing: "cubicIn" }).delay(0.4).to(0.4, { opacity: 255 }, { easing: "cubicOut" })
            )
            .start();
    }
    updateLabels(data: any) {
        const { settlementResult, result } = data;
        const lang = window.i18n.curLang === "vi" ? "" : `_${window.i18n.curLang}`;
        const choice = this.getTextFollowChoice({ settlementResult });

        this.total.spriteFrame = this.atlas.getSpriteFrame(result.dice1 + result.dice2);

        this.result.spriteFrame = this.getSpriteFrameByLang(choice, lang);
    }

    getTextFollowChoice({ settlementResult }): string {
        return settlementResult.find((choice) => settlementResult[choice]);
    }

    getSpriteFrameByLang(choice: string, lang: string) {
        if (choice === "seven") {
            return this.atlas.getSpriteFrame(`scoreboard_${choice}`);
        } else {
            const name = `scoreboard_${choice}`;
            return this.atlas.getSpriteFrame(`${name}-${lang}`);
        }
    }
}
