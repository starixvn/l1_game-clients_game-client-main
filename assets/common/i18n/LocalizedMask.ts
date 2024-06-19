import { OperatorAlias } from "../../ISystem";
import * as sessionManager from "../../common/auth/SessionManager";
import NoticeUtil from "../utils/NoticeUtil";

const { ccclass } = cc._decorator;

@ccclass
export default class LocalizedMask extends cc.Mask {
    onLoad() {
        this.getSpriteFrameByLang(NoticeUtil.getCurrentLanguage());
    }

    getSpriteFrameByLang(lang: string) {
        const system = sessionManager.getOperator()?.toUpperCase() === OperatorAlias.SG ? "sc1" : "sc2";
        cc.resources.load<cc.SpriteFrame>(`splash/images/tagline_${system}_${lang}`, cc.SpriteFrame, (err, frame) => {
            if (frame) {
                this.spriteFrame = frame;
            }
        });
    }
}
