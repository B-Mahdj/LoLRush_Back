export type ChallengeData = {
    daysUntilExpiration: number;
    players_info: PlayerInfo[];
}

export type PlayerInfo = {
    username: string;
    rank:Rank;
    wins:number;
    losses:number;
    winrate:number;
}

export type Rank = {
    tier:string;
    rank:string;
    leaguePoints:number;
}