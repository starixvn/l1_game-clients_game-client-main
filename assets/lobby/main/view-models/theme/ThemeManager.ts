export interface IInfoLobbyTheme {
    theme: string;
    currencyGroups?: {
        [currency: string]: {
            theme: string;
        };
    };
}

export class ThemeManager {
    private readonly DEFAULT_PATH = "lobby/themes";
    private currentGroupCurrency = "";

    constructor(private infoLobbyTheme: IInfoLobbyTheme, private DEFAULT_CURRENCY_GROUP_THEME: string) {}

    public getThemePath() {
        if (this.currentGroupCurrency in this.infoLobbyTheme.currencyGroups) {
            return `${this.DEFAULT_PATH}/${this.getTheme()}`;
        }
        return `${this.DEFAULT_PATH}/${this.infoLobbyTheme.theme}`;
    }

    public isUseTheme() {
        return this.currentGroupCurrency in this.infoLobbyTheme.currencyGroups;
    }

    public getTheme() {
        return this.infoLobbyTheme.currencyGroups[this.currentGroupCurrency].theme ?? this.DEFAULT_CURRENCY_GROUP_THEME;
    }

    public setCurrentGroupCurrency(currency: string) {
        this.currentGroupCurrency = currency;
    }
}
