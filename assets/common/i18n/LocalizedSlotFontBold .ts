import LocalizedFont from "./LocalizedFont";

const { ccclass, menu } = cc._decorator;

@ccclass
@menu("i18n/LocalizedSlotFontBold ")
export default class LocalizedSlotFontBold extends LocalizedFont {
    initData() {
        this.fontBases = {
            vi: {
                name: "Kodchasan-Bold",
                loadRemote: false
            },
            id: {
                name: "Kodchasan-Bold",
                loadRemote: false
            },
            en: {
                name: "Kodchasan-Bold",
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
            ...globalThis?.fontMapping?.slotBold
        };
    }
}
