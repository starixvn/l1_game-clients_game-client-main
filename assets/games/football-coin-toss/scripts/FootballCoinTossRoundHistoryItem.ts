const { ccclass, property } = cc._decorator;

@ccclass
export default class FootballCoinTossRoundHistoryItem extends cc.Component {
    @property(cc.Sprite)
    sprite: cc.Sprite = null;

    @property(cc.SpriteAtlas)
    atlas: cc.SpriteAtlas = null;

    public setValue(home: boolean) {
        if (!this.sprite || !this.atlas) {
            return;
        }



        let spriteName = `soikeo-chip-blue`;
        if (!home) {
            spriteName = `soikeo-chip-red`;
        }

        this.sprite.spriteFrame = this.atlas.getSpriteFrame(spriteName);
    }
}
