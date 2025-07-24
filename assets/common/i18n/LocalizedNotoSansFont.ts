import LocalizedFont from "./LocalizedFont";

const { ccclass, menu } = cc._decorator;

@ccclass
@menu("i18n/LocalizedNotoSansFont")
export default class LocalizedNotoSansFont extends LocalizedFont {
    initData() {
        this.fontBases = {
            vi: {
                name: "NotoSans-Regular",
                loadRemote: false
            },
            id: {
                name: "NotoSans-Regular",
                loadRemote: false
            },
            en: {
                name: "NotoSans-Regular",
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
            ...globalThis?.fontMapping?.notoSans
        };
    }
}
