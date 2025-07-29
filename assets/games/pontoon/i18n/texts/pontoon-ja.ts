import { reloadLanguageData } from "../../../../common/i18n/CustomLanguageData";

export const phrases = {
    gameNames: { 72: "Pontoon" },
    pontoon: {
        pontoon_pay: "ポンツーンは%{odds}倍配当",
        five_card: "ファイブカード",
        five_card_pay: "ファイブカード・トリックは%{odds}倍の配当",
        pontoon: "Pontoon"
    }
};

reloadLanguageData("ja", phrases);
