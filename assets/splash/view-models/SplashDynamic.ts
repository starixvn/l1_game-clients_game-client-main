import { OperatorAlias } from "../../ISystem";
import * as sessionManager from "../../common/auth/SessionManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SplashDynamic extends cc.Component {
    @property(cc.Sprite)
    sprLogo: cc.Sprite = null;

    @property(cc.Sprite)
    sprTagPower: cc.Sprite = null;

    @property(cc.Sprite)
    sprTagline: cc.Sprite = null;

    @property
    operatorName = "";

    private href = `${window.location.origin}/splash-resources`;

    onLoad() {
        this.loadLogoOperator();
        this.loadTagPower();
        this.loadTagline();
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

    loadTagline() {
        const system = sessionManager.getOperator()?.toUpperCase() === OperatorAlias.SG ? "sc1" : "sc2";
        console.log("loadTagline", system);
        cc.resources.load<cc.SpriteFrame>(`splash/images/tagline_${system}_${window.i18n.curLang}`, cc.SpriteFrame, (err, frame) => {
            if (frame) {
                this.sprTagline.spriteFrame = frame;
            }
        });
    }
}
