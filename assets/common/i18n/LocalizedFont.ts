import ColorAssembler2D from "../../../assets/common/ColorAssembler2D";
import GameUtils from "../GameUtils";
const { ccclass, property, menu } = cc._decorator;

const LanguageFont = cc.Class({
    name: "LanguageFont",
    properties: {
        language: "",
        name: "",
        loadRemote: false
    }
});

@ccclass
@menu("i18n/LocalizedFont")
export default class LocalizedFont extends cc.Component {
    @property({ type: LanguageFont })
    overrideFonts: LanguageFont[] = [];

    @property
    enableCacheMode = false;

    label: cc.Label = null;
    color2D: ColorAssembler2D = null;
    fontBases = {};

    onLoad() {
        this.initData();
        this.label = this.node.getComponent(cc.Label);
        this.color2D = this.node.getComponent(ColorAssembler2D);
        this.updateFont();
    }

    initData() {
        this.fontBases = {
            vi: {
                name: "NotoSerif-Regular",
                loadRemote: false
            },
            id: {
                name: "NotoSerif-Regular",
                loadRemote: false
            },
            en: {
                name: "NotoSerif-Regular",
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
            ...globalThis?.fontMapping?.regular
        };
    }

    updateFont() {
        const font = this.getFontNameByLanguage();
        if (this.label) {
            this.loadFont(font.name, font.loadRemote).then((font) => {
                if (this.label && this.label.isValid) {
                    this.label.font = font;
                    this.enableCacheMode && this.handleCacheMode();
                }

                this.color2D && this.color2D.updateColors();
            });
        }
    }

    handleCacheMode() {
        const lang = window.i18n.curLang;
        switch (lang) {
            case "th":
            case "zh_cn":
            case "zh_tw":
                this.label.cacheMode = cc.Label.CacheMode.BITMAP;
                break;

            default:
                this.label.cacheMode = cc.Label.CacheMode.CHAR;
                break;
        }
    }

    getFontNameByLanguage(): any {
        const lang = window.i18n.curLang;
        const overrideFonts = this.overrideFonts.find((data) => data.language === lang);
        const overrideFont = overrideFonts !== undefined ? overrideFonts : this.fontBases[lang];
        return overrideFont || this.fontBases["en"];
    }

    loadFont(name: string, loadRemote: boolean) {
        if (loadRemote) {
            return new Promise<cc.Font>((resolve, reject) => {
                GameUtils.loadRemoteFromSharedResource<cc.Font>(`localization/fonts/${name}`).then((font) => {
                    resolve(font);
                });
            });
        }
        return new Promise<cc.Font>((resolve, reject) => {
            cc.resources.load<cc.Font>(`fonts/${name}`, cc.Font, (err, font) => {
                resolve(font);
            });
        });
    }
}
