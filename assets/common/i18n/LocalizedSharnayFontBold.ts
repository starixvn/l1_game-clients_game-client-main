import LocalizedFont from "./LocalizedFont";

const { ccclass, menu } = cc._decorator;

@ccclass
@menu("i18n/LocalizedSharnayFontBold")
export default class LocalizedSharnayFontBold extends LocalizedFont {
    initData() {
        this.fontBases = {
            vi: {
                name: "UTM-Sharnay",
                loadRemote: false
            },
            id: {
                name: "UTM-Sharnay",
                loadRemote: false
            },
            en: {
                name: "UTM-Sharnay",
                loadRemote: false
            },
            th: {
                name: "NotoSerifThai-Bold",
                loadRemote: false
            },
            zh_cn: {
                name: "NotoSerifZHCN-Bold",
                loadRemote: false
            },
            zh_tw: {
                name: "NotoSerifZHTW-Bold",
                loadRemote: false
            },
            ...globalThis?.fontMapping?.sharnayBold
        };
    }
}
