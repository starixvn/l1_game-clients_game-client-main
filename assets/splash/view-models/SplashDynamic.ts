import { OperatorAlias } from "../../ISystem";
import * as sessionManager from "../../common/auth/SessionManager";
import LocalizedMask from "../../common/i18n/LocalizedMask";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SplashDynamic extends cc.Component {
    @property(cc.Sprite)
    sprLogo: cc.Sprite = null;

    @property(cc.Sprite)
    sprTagPower: cc.Sprite = null;

    @property(cc.Sprite)
    sprTagline: cc.Sprite = null;

    // @property(cc.Node)
    // nodeLightMask: cc.Node = null;

    // @property(LocalizedMask)
    // mask: LocalizedMask = null;

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
        console.log("operatorName", this.operatorName);
    }

    protected onDestroy(): void {
        //this.unschedule(this.handleAnimLightMask);
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
        //const widthTagLine = this.sprTagline?.node?.width;
        // if (this?.mask?.node) {
        //     this.mask.node.width = widthTagLine;
        // }

        //this.handleAnimLightMask();
        //this.schedule(this.handleAnimLightMask, 3);
    }

    // handleAnimLightMask = () => {
    //     if (this.nodeLightMask) {
    //         this.nodeLightMask.active = true;
    //         const widthTagLine = this.sprTagline?.node?.width;
    //         this.nodeLightMask.x = -(widthTagLine / 2);

    //         cc.tween(this?.nodeLightMask)
    //             .to(1, { position: cc.v2(widthTagLine / 2, 0) })
    //             .call(() => {
    //                 this.nodeLightMask && (this.nodeLightMask.active = false);
    //             })
    //             .delay(2)
    //             .start();
    //     }
    // };

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
