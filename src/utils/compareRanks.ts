import { PlayerInfo, Rank } from '../types/defaut_types';

function compareRanks(rankA: Rank, rankB: Rank): number {
  // Define the order of tiers and ranks
  const tierOrder = ['Challenger', 'Grandmaster', 'Master', 'Diamond','Emerald', 'Platinum', 'Gold', 'Silver', 'Bronze', 'Iron'];
  const rankOrder = ['I', 'II', 'III', 'IV', 'V'];

  // Compare tiers
  const tierComparison = tierOrder.indexOf(rankB.tier) - tierOrder.indexOf(rankA.tier);
  if (tierComparison !== 0) {
    return tierComparison;
  }

  // Compare ranks within the same tier
  const rankComparison = rankOrder.indexOf(rankB.rank) - rankOrder.indexOf(rankA.rank);
  if (rankComparison !== 0) {
    return rankComparison;
  }

  // Compare league points
  return rankB.leaguePoints - rankA.leaguePoints;
}

export function comparePlayerInfos(playerA: PlayerInfo, playerB: PlayerInfo): number {
  return compareRanks(playerA.rank, playerB.rank);
}
