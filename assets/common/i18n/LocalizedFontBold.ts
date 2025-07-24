import LocalizedFont from "./LocalizedFont";

const { ccclass, menu } = cc._decorator;

@ccclass
@menu("i18n/LocalizedFontBold")
export default class LocalizedFontBold extends LocalizedFont {
    initData() {
        this.fontBases = {
            vi: {
                name: "NotoSerif-Bold",
                loadRemote: false
            },
            id: {
                name: "NotoSerif-Bold",
                loadRemote: false
            },
            en: {
                name: "NotoSerif-Bold",
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
            ...globalThis?.fontMapping?.bold
        };
    }
}
