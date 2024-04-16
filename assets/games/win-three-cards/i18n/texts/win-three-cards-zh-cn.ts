import { reloadLanguageData } from "../../../../common/i18n/CustomLanguageData";

export const phrases = {
    gameNames: {
        61: "赢三张"
    },
    lobbyNames: {
        61: "赢三张"
    },
    winThreeCards: {
        dragon: "龙",
        phoenix: "凤",
        result: "结果（龙 | 凤）",
        killer235: "235",
        threeOfAKind: "三条",
        straightFlush: "同花顺",
        flush: "同花",
        straight: "顺子",
        onePair: "一对",
        highCard: "高牌",
        pair8Plus: "配对 8 Plus",
        dragon_win: "龙赢",
        phoenix_win: "凤赢",
        pair8PlusInfo: "对子9到对子A，顺子, 同花, 同花顺, \n三条",
        handInfo: "三条>同花顺>同花>顺子>对子>高牌",
        tie: "平局",
        pair8PlusSta: "配对 8 +:",
        dragonSta: "龙:",
        phoenixSta: "凤:",
        dragonShort: "龙",
        phoenixShort: "凤"
    }
};

reloadLanguageData("zh_cn", phrases);
