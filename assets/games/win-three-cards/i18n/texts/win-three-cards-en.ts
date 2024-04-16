import { reloadLanguageData } from "../../../../common/i18n/CustomLanguageData";

export const phrases = {
    gameNames: {
        61: "Win Three Cards"
    },
    lobbyNames: {
        61: "Win Three Cards"
    },
    winThreeCards: {
        dragon: "Dragon",
        phoenix: "Phoenix",
        result: "Result (Dragon | Phoenix)",
        killer235: "235",
        threeOfAKind: "Three of a Kind",
        straightFlush: "Straight Flush",
        flush: "Flush",
        straight: "Straight",
        onePair: "Pair",
        highCard: "High Card",
        pair8Plus: "Pair 8 Plus",
        dragon_win: "Dragon Win",
        phoenix_win: "Phoenix Win",
        pair8PlusInfo: "Pair 9 to Pair A, Straight, Flush, Straight Flush, Three of a kind",
        handInfo: "Three of a Kind > Straight Flush > Flush > Straight > Pair > High Card",
        tie: "Tie",
        pair8PlusSta: "Pair 8 +:",
        dragonSta: "Dragon:",
        phoenixSta: "Phoenix:",
        dragonShort: "D",
        phoenixShort: "P"
    }
};

reloadLanguageData("en", phrases);
