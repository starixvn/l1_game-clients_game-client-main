import { reloadLanguageData } from "../../../../common/i18n/CustomLanguageData";

export const phrases = {
    gameNames: {
        61: "贏三張"
    },
    lobbyNames: {
        61: "贏三張"
    },
    winThreeCards: {
        dragon: "龍",
        phoenix: "鳳",
        result: "結果（龍 | 鳳）",
        killer235: "235",
        threeOfAKind: "三條",
        straightFlush: "同花順",
        flush: "同花",
        straight: "順子",
        onePair: "一對",
        highCard: "高牌",
        pair8Plus: "配對 8 Plus",
        dragon_win: "龍贏",
        phoenix_win: "鳳贏",
        pair8PlusInfo: "對子9到對子A，順子, 同花, 同花順, \n三條",
        handInfo: "三條>同花順>同花>順子>對子>高牌",
        tie: "平局",
        pair8PlusSta: "配對 8 +:",
        dragonSta: "龍:",
        phoenixSta: "鳳:",
        dragonShort: "龍",
        phoenixShort: "鳳"
    }
};

reloadLanguageData("zh_tw", phrases);
