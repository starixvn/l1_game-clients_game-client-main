import { i18n } from "../../../ClientModules";
import { HandRanks } from "./WinThreeCardsConstant";

export const StringHelper = {
    winThreeCardsNameSpace: "winThreeCards",
    Tie: "tie",
    Zero: "0",
    Win: "win",
    Empty: "",
    dragonSettlementColor: "#008fff",
    phoenixSettlementColor: "#f62d2d"
};

export const getCardsResult = (result: number) => {
    return i18n.t(`${StringHelper.winThreeCardsNameSpace}.${HandRanks[result]}`);
};

export const changeCacheMode = (label: cc.Label) => {
    const lang = window.i18n.curLang;
    switch (lang) {
        case "th":
        case "zh_cn":
        case "zh_tw":
            label.cacheMode = cc.Label.CacheMode.BITMAP;
            return;
        default:
            label.cacheMode = cc.Label.CacheMode.CHAR;
            return;
    }
};

export const convertRank = (num: number): string => {
    num++;
    const dict = {
        11: "J",
        12: "Q",
        13: "K",
        1: "A",
        0: " "
    };
    return dict[num] || num.toString();
};
