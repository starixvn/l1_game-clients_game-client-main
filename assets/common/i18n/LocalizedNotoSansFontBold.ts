import LocalizedFont from "./LocalizedFont";

const { ccclass, menu } = cc._decorator;

@ccclass
@menu("i18n/LocalizedNotoSansFontBold")
export default class LocalizedNotoSansFontBold extends LocalizedFont {
    initData() {
        this.fontBases = {
            vi: {
                name: "NotoSans-Bold",
                loadRemote: false
            },
            id: {
                name: "NotoSans-Bold",
                loadRemote: false
            },
            en: {
                name: "NotoSans-Bold",
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
            ...globalThis?.fontMapping?.notoSansBold
        };
    }
}
