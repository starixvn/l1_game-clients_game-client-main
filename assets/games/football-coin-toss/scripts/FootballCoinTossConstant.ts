export enum BetChoice {
    Away = "away",
    Home = "home",
}

export class MatchConfig {
    home: string;
    away: string;
}

export class LastMatchConfig {
    home: string;
    away: string;
    roundId: number;
}
