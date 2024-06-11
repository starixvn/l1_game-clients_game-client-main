const { ccclass, property } = cc._decorator;

@ccclass
export default class MiniCoinTossRoundHistoryItem extends cc.Component {
    @property(cc.Sprite)
    sprite: cc.Sprite = null;

    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;

    public setValue(head: boolean) {
        if (!this.sprite || !this.atlas) {
            return;
        }



        let spriteName = `soikeo-chip-blue`;
        if (!head) {
            spriteName = `soikeo-chip-red`;
        }

        this.sprite.spriteFrame = this.atlas.getSpriteFrame(spriteName);
    }
}
