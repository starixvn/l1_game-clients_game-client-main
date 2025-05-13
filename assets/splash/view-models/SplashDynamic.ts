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

    private readonly href = `${window.location.origin}/splash-resources`;

    onLoad() {
        if (CC_PREVIEW) {
            return;
        }
        this.loadLogoOperator();
        this.loadTagPower();
        this.loadTagline();
    }

    loadLogoOperator() {
        const imagePath = `${this.href}/logo_${this.operatorName}.webp`;
        cc.assetManager.loadRemote(imagePath, (err, imageAsset: "webp") => {
            try {
                const spriteFrameTmp = new cc.SpriteFrame(imageAsset);
                this.sprLogo.spriteFrame = spriteFrameTmp;
            } catch (e) {}
        });
    }

    loadTagPower() {
        if (this.sprTagPower) {
            const imagePath = `${this.href}/powered_by_Vgaming_${window.i18n.curLang}.webp`;
            cc.assetManager.loadRemote(imagePath, (err, imageAsset: "webp") => {
                try {
                    const spriteFrameTmp = new cc.SpriteFrame(imageAsset);
                    this.sprTagPower.spriteFrame = spriteFrameTmp;
                } catch (e) {}
            });
        }
    }

    private async loadTagline() {
        this.sprTagline.spriteFrame = await this.loadTaglineImage();
    }

    private loadTaglineImage() {
        const system = sessionManager.getOperator()?.toUpperCase() === OperatorAlias.SG ? "sc1" : "sc2";
        const path = `splash/images/splash_text_${window.i18n.curLang}`;
        return new Promise<cc.SpriteFrame>((resolve, reject) => {
            cc.resources.load<cc.SpriteFrame>(path, cc.SpriteFrame, (err, frame) => {
                if (err || !frame) {
                    reject(err);
                } else {
                    resolve(frame);
                }
            });
        });
    }
}
