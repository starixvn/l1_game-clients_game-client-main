import { reloadLanguageData } from "../../../../common/i18n/CustomLanguageData";

export const phrases = {
    gameNames: { 61: "スリーカードで勝利" },
    lobbyNames: { 61: "スリーカードで勝利" },
    winThreeCards: {
        dragon: "ドラゴン",
        phoenix: "フェニックス",
        result: "結果（龍｜鳳凰）",
        killer235: "２３５",
        threeOfAKind: "スリーカード",
        straightFlush: "ストフラ",
        flush: "フラッシュ",
        straight: "ストレート",
        onePair: "ペア",
        highCard: "ハイカード",
        pair8Plus: "ペア 8 プラス",
        dragon_win: "ドラゴンの勝ち",
        phoenix_win: "フェニックスウィン",
        pair8PlusInfo: "ペア9からペアA、ストレート、フラッシュ、ストフラ、スリーカード",
        handInfo: "スリーカード > ストフラ > フラッシュ > ストレート > ペア > ハイカード",
        tie: "引き分け",
        pair8PlusSta: "ペア8 +:",
        dragonSta: "ドラゴン：",
        phoenixSta: "フェニックス：",
        dragonShort: "D",
        phoenixShort: "P"
    }
};

reloadLanguageData("ja", phrases);
