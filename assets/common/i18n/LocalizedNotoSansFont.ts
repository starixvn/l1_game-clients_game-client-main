import LocalizedFont from "./LocalizedFont";

const { ccclass, menu } = cc._decorator;

@ccclass
@menu("i18n/LocalizedSharnayFontBold")
export default class LocalizedSharnayFontBold extends LocalizedFont {
    initData() {
        this.fontBases = {
            vi: "NotoSans-Regular",
            id: "NotoSans-Regular",
            en: "NotoSans-Regular",
            th: "NotoSerifThai-Bold",
            zh_cn: "NotoSerifZHCN-Bold",
            zh_tw: "NotoSerifZHTW-Bold"
        };
    }
}
