import BigWinAnimation from "./BigWinAnimation";

const { ccclass, property } = cc._decorator;

@ccclass
export default class JackpotWinningAmount extends BigWinAnimation {
    @property(cc.Sprite)
    poolSprite: cc.Sprite = null;

    async loadPoolSprite(pool: string) {
        this.loadSpritePrize(pool).then((frame) => {
            if (frame) {
                this.poolSprite.spriteFrame = frame;
            }
        });
    }

    async loadSpritePrize(pool: string) {
        return new Promise<cc.SpriteFrame>((resolve) => {
            const prizeTxt = `text-${pool}`;
            cc.resources.load<cc.SpriteFrame>(`shared/slot-game/textures/prize-jackpot/${prizeTxt}`, cc.SpriteFrame, (err, frame) => {
                if (frame) {
                    resolve(frame);
                }
            });
        });
    }
}
