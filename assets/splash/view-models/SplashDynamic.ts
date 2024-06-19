const { ccclass, property } = cc._decorator;

@ccclass
export default class SplashDynamic extends cc.Component {
    @property(cc.Sprite)
    sprLogo: cc.Sprite = null;

    @property(cc.Sprite)
    sprTagPower: cc.Sprite = null;

    @property
    operatorName = "";

    private href = `${window.location.origin}/splash-resources`;

    onLoad() {
        this.loadLogoOperator();
        this.loadTagPower();
    }

    loadLogoOperator() {
        const imagePath = `${this.href}/logo_${this.operatorName}.png`;
        cc.assetManager.loadRemote(imagePath, (err, imageAsset: "png") => {
            const spriteFrameTmp = new cc.SpriteFrame(imageAsset);
            this.sprLogo.spriteFrame = spriteFrameTmp;
        });
    }

    loadTagPower() {
        if (this.sprTagPower) {
            console.log("loadTagPower", window.i18n.curLang);
            const imagePath = `${this.href}/powered_by_sc2_${window.i18n.curLang}.png`;
            cc.assetManager.loadRemote(imagePath, (err, imageAsset: "png") => {
                const spriteFrameTmp = new cc.SpriteFrame(imageAsset);
                this.sprTagPower.spriteFrame = spriteFrameTmp;
            });
        }
    }
}
