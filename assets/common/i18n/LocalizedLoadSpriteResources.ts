const { ccclass, property, menu, executeInEditMode } = cc._decorator;

@ccclass
@executeInEditMode
@menu("i18n/LocalizedLoadSpriteResources")
export default class LocalizedLoadSpriteResources extends cc.Component {
    @property
    path = "";

    @property()
    nameImage = "";

    protected sprite: cc.Sprite;

    onLoad() {
        this.fetchRender();
    }

    public fetchRender() {
        const sprite = this.getComponent(cc.Sprite);
        if (sprite) {
            this.sprite = sprite;
            this.updateSprite({ language: window.i18n.curLang, name: this.nameImage });
            return;
        }
    }

    public async getSpriteFrameByLang(lang: string, name: string) {
        return new Promise<cc.SpriteFrame>((resolve, reject) => {
            cc.resources.load<cc.SpriteFrame>(`${this.path}/${name}_${lang}`, cc.SpriteFrame, (err, frame) => {
                if (err || !frame) {
                    reject(err);
                } else {
                    resolve(frame);
                }
            });
        });
    }

    async updateSprite({ language, name }) {
        if (!this.sprite) {
            if (this.node.activeInHierarchy) {
                cc.error("Failed to update localized sprite, sprite component is invalid!");
            }
            return;
        }

        const spriteFrame = await this.getSpriteFrameByLang(language, name);
        if (!this || !this.isValid || !this.node.isValid) {
            return;
        }
        this.sprite.spriteFrame = spriteFrame;
    }
}
