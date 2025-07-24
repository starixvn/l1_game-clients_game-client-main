import LocalizedFont from "./LocalizedFont";

const { ccclass, menu } = cc._decorator;

@ccclass
@menu("i18n/LocalizedSlotFont")
export default class LocalizedSlotFont extends LocalizedFont {
    initData() {
        this.fontBases = {
            vi: {
                name: "Kodchasan-Regular",
                loadRemote: false
            },
            id: {
                name: "Kodchasan-Regular",
                loadRemote: false
            },
            en: {
                name: "Kodchasan-Regular",
                loadRemote: false
            },
            th: {
                name: "NotoSerifThai-Regular",
                loadRemote: false
            },
            zh_cn: {
                name: "NotoSerifZHCN-Regular",
                loadRemote: false
            },
            zh_tw: {
                name: "NotoSerifZHTW-Regular",
                loadRemote: false
            },
            ...globalThis?.fontMapping?.slot
        };
    }
}
