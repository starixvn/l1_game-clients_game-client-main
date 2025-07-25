import { reloadLanguageData } from "../../../../common/i18n/CustomLanguageData";

export const phrases = {
    gameNames: { 72: "Pontoon" },
    pontoon: {
        pontoon_pay: "ポントゥーン 配当%{odds}倍",
        five_card: "ファイブカード",
        five_card_pay: "ファイブカード・トリックは%{odds}倍の配当",
        pontoon: "Pontoon"
    }
};

reloadLanguageData("ja", phrases);
