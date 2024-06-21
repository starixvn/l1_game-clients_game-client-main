const { ccclass, property } = cc._decorator;

@ccclass
export default class LoadImageRemoteUrl extends cc.Component {
    @property
    pathNameImage = "";

    @property(cc.Sprite)
    sprFrame: cc.Sprite = null;

    @property
    isCheckLanguage = false;

    @property
    typeExtensionImage = "webp";

    protected onLoad(): void {
        this.updateImage();
    }

    loadImageRemote() {
        const href = `${window.location.origin}`;
        const imagePath = `${href}/${this.pathNameImage}${this.isCheckLanguage ? window.i18n.curLang : ""}.${this.typeExtensionImage}`;

        return new Promise<cc.Texture2D>((resolve, reject) => {
            cc.assetManager.loadRemote(imagePath, (err, imageAsset: cc.Texture2D) => {
                if (err) {
                    return;
                }
                resolve(imageAsset);
            });
        });
    }

    private async updateImage() {
        const sprFrame = await this.loadImageRemote();
        const spriteFrameTmp = new cc.SpriteFrame(sprFrame);
        if (!this || !this.isValid || !this.node.isValid || !this.sprFrame.node.isValid) {
            return;
        }
        this.sprFrame.spriteFrame = spriteFrameTmp;
    }
}
