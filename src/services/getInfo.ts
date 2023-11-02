import axios from 'axios';
import { ChallengeData, PlayerInfo, Rank } from '../types/defaut_types';
import { riot_api_config } from '../utils/header_api_riot';
import { comparePlayerInfos } from '../utils/compareRanks';
import { client } from '../database/config';

export async function getInfo(code: number): Promise<ChallengeData | null> {
  console.log('Code:', code);

  // Based on the code given in parameter, we get the region and the player_usernames from the database
  try {
    await client.connect();
    const db = client.db('LoLRushDB');
    const collection = db.collection('Page');

    const result = await collection.findOne({ code: code });

    if (result) {
      const player_usernames = result.player_usernames;
      const region = result.region;
      const challengeEndDate = result.challengeEndDate;

      console.log('Player usernames:', player_usernames);
      console.log('Region:', region);
      console.log('Challenge end date:', challengeEndDate);

      const challengeData: ChallengeData = {
        challengeEndDate: challengeEndDate,
        players_info: await getPlayerInfo(player_usernames, region)
      };
      return challengeData;
    } else {
      throw new Error('Code not found'); // Handle the case where the code doesn't exist
    }
  } catch (err) {
    console.error(err);
    throw err; // Rethrow the error for the caller to handle
  } finally {
    client.close();
  }
}

async function getPlayerInfo(player_usernames: string[], region: string): Promise<PlayerInfo[]> {
  const playerData = await Promise.all(player_usernames.map(async (player_username) => {
    const [rank, wins, losses] = await getPlayerStats(player_username, region);

    const totalGames = wins + losses;
    const winrate = totalGames > 1 ? Math.round((wins / totalGames) * 100) : 0;

    return {
      username: player_username,
      rank,
      wins,
      losses,
      winrate,
    };
  }));

  playerData.sort(comparePlayerInfos);
  return playerData;
}

async function getPlayerStats(player_username: string, region: string): Promise<[Rank, number, number]> {
  const BASE_URL = getRegionBaseUrl(region);
  const endpoint1 = `/lol/summoner/v4/summoners/by-name/${player_username}`;
  const endpoint2 = `/lol/league/v4/entries/by-summoner`;

  try {
    // Make the first API call to get summoner data
    const summonerData = await axios.get(`${BASE_URL}${endpoint1}`, riot_api_config);
    console.log(summonerData.data);

    const encryptedSummonerId = summonerData.data.id;

    // Make the second API call with the encryptedSummonerId to get league data
    const leagueData = await axios.get(`${BASE_URL}${endpoint2}/${encryptedSummonerId}`, riot_api_config);
    console.log(leagueData.data);

    const rankedSoloQueue = findRankedSoloQueue(leagueData.data);

    const rank: Rank = rankedSoloQueue
      ? {
          tier: rankedSoloQueue.tier,
          rank: rankedSoloQueue.rank,
          leaguePoints: rankedSoloQueue.leaguePoints,
        }
      : {
          tier: 'UNRANKED',
          rank: '',
          leaguePoints: 0,
        };

    const wins = rankedSoloQueue ? rankedSoloQueue.wins : 0;
    const losses = rankedSoloQueue ? rankedSoloQueue.losses : 0;

    return [rank, wins, losses];
  } catch (error) {
    console.error('Error:', error.message);
    // Handle or propagate the error as needed
    throw error;
  }
}

function findRankedSoloQueue(data: any[]): any{
  for (const obj of data) {
    if (obj.queueType === 'RANKED_SOLO_5x5') {
      return obj;
    }
  }
  return null; // Return null if no object with the specified queueType is found
}

export function getRegionBaseUrl(region: string) {
  const regionMap = {
    'NA1': 'https://na1.api.riotgames.com',
    'EUW1': 'https://euw1.api.riotgames.com',
    'BR1': 'https://br1.api.riotgames.com',
    'EUN1': 'https://eun1.api.riotgames.com',
    'JP1': 'https://jp1.api.riotgames.com',
    'KR': 'https://kr.api.riotgames.com',
    'LA1': 'https://la1.api.riotgames.com',
    'LA2': 'https://la2.api.riotgames.com',
    'OC1': 'https://oc1.api.riotgames.com',
    'TR1': 'https://tr1.api.riotgames.com',
    'RU': 'https://ru.api.riotgames.com',
    'PH2': 'https://ph2.api.riotgames.com',
    'SG2': 'https://sg2.api.riotgames.com',
    'TH2': 'https://th2.api.riotgames.com',
    'TW2': 'https://tw2.api.riotgames.com',
    'VN2': 'https://vn2.api.riotgames.com',
  };

  return regionMap[region as keyof typeof regionMap] || 'https://na1.api.riotgames.com';
}
