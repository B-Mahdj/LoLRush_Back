import { PlayerInfo, Rank } from '../types/defaut_types';

function compareRanks(rankA: Rank, rankB: Rank): number {
  console.log('Comparing ranks:', rankA, rankB);
  // Define the order of tiers and ranks
  const tierOrder = ['CHALLENGER', 'GRANDMASTER', 'MASTER', 'DIAMOND','EMERALD', 'PLATINUM', 'GOLD', 'SILVER', 'BRONZE', 'IRON', 'UNRANKED'];
  const rankOrder = ['I', 'II', 'III', 'IV', 'V'];

  // Compare tiers
  console.log('Tier comparison:', tierOrder.indexOf(rankB.tier) - tierOrder.indexOf(rankA.tier));
  const tierComparison = tierOrder.indexOf(rankA.tier) - tierOrder.indexOf(rankB.tier);
  if (tierComparison !== 0) {
    return tierComparison;
  }

  console.log('Rank comparison:', rankOrder.indexOf(rankB.rank) - rankOrder.indexOf(rankA.rank));
  // Compare ranks within the same tier
  const rankComparison = rankOrder.indexOf(rankA.rank) - rankOrder.indexOf(rankB.rank);
  if (rankComparison !== 0) {
    return rankComparison;
  }

  console.log('League points comparison:', rankA.leaguePoints - rankB.leaguePoints);
  // Compare league points
  return rankA.leaguePoints - rankB.leaguePoints;
}

export function comparePlayerInfos(playerA: PlayerInfo, playerB: PlayerInfo): number {
  return compareRanks(playerA.rank, playerB.rank);
}
