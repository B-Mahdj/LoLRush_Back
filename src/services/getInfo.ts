import axios from 'axios';
import {PlayerInfo, Rank} from '../types/defaut_types';
import { riot_api_config } from '../utils/header_api_riot';
import { comparePlayerInfos } from '../utils/compareRanks';
import { client } from '../database/config';


export async function getInfo (code:number): Promise<PlayerInfo[] | null> { 
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

      console.log('Player usernames:', player_usernames);
      console.log('Region:', region);

      const playerInfo = await getPlayerInfo(player_usernames, region);
      return playerInfo;
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

async function getPlayerInfo(player_usernames:string[], region:string): Promise<PlayerInfo[]> {
  const playersInfo: PlayerInfo[] = [];

  for (const player_username of player_usernames) {
    const playerInfo: PlayerInfo = {
      username: player_username,
      rank: await getRank(player_username, region),
      wins: await getWins(player_username, region),
      losses: await getLosses(player_username, region),
      winrate: 0,
    };

    if(playerInfo.wins + playerInfo.losses > 1){
    playerInfo.winrate = Math.round((playerInfo.wins / (playerInfo.wins + playerInfo.losses)) * 100);
    }
    else{
      playerInfo.winrate = 0;
    }
    console.log("Playerinfo :" + playerInfo.username, playerInfo.rank, playerInfo.wins, playerInfo.losses, playerInfo.winrate);

    playersInfo.push(playerInfo);
  }

  playersInfo.sort(comparePlayerInfos);
  return playersInfo;
}

async function getRank(player_username:string, region:string): Promise<Rank> {
  let BASE_URL = getRegionBaseUrl(region); 
  const endpoint1 = `/lol/summoner/v4/summoners/by-name/${player_username}`;
  const endpoint2 = `/lol/league/v4/entries/by-summoner`;

  return axios
  .get(`${BASE_URL}${endpoint1}`, riot_api_config)
  .then((response) => {
    console.log(response.data);
    const encryptedSummonerId = response.data.id;
    return axios.get(`${BASE_URL}${endpoint2}/${encryptedSummonerId}`, riot_api_config);
  })
  .then((response) => {
      console.log(response.data);
      let rankedSoloQueue = findRankedSoloQueue(response.data);

      if (rankedSoloQueue === null) {
        return {
          tier: 'UNRANKED',
          rank: '',
          leaguePoints: 0
        };
      }

      return {
        tier: rankedSoloQueue.tier,
        rank: rankedSoloQueue.rank,  
        leaguePoints: rankedSoloQueue.leaguePoints
      };
  })
  .catch((error) => {
    console.error('Error:', error.message);
    return null;
  });
}

async function getWins(player_username:string, region:string): Promise<number> {
  let BASE_URL = getRegionBaseUrl(region); 
  const endpoint1 = `/lol/summoner/v4/summoners/by-name/${player_username}`;
  const endpoint2 = `/lol/league/v4/entries/by-summoner`;

  return axios
  .get(`${BASE_URL}${endpoint1}`, riot_api_config)
  .then((response) => {
    console.log(response.data);
    const encryptedSummonerId = response.data.id;
    return axios.get(`${BASE_URL}${endpoint2}/${encryptedSummonerId}`, riot_api_config);
  })
  .then((response) => {
      console.log(response.data);
      let rankedSoloQueue = findRankedSoloQueue(response.data);

      if (rankedSoloQueue === null) {
        return 0;
      }
      else{
        return rankedSoloQueue.wins;  
      }
  })
  .catch((error) => {
    console.error('Error:', error.message);
    return null;
  });
}

async function getLosses(player_username:string, region:string): Promise<number> {
  let BASE_URL = getRegionBaseUrl(region); 
  const endpoint1 = `/lol/summoner/v4/summoners/by-name/${player_username}`;
  const endpoint2 = `/lol/league/v4/entries/by-summoner`;

  return axios
  .get(`${BASE_URL}${endpoint1}`, riot_api_config)
  .then((response) => {
    console.log(response.data);
    const encryptedSummonerId = response.data.id;
    return axios.get(`${BASE_URL}${endpoint2}/${encryptedSummonerId}`, riot_api_config);
  })
  .then((response) => {
      console.log(response.data);
      let rankedSoloQueue = findRankedSoloQueue(response.data);

      if (rankedSoloQueue === null) {
        return 0;
      }
      else{
        return rankedSoloQueue.losses;  
      }
  })
  .catch((error) => {
    console.error('Error:', error.message);
    return null;
  });
}

function findRankedSoloQueue(data: any[]): any | null {
  for (const obj of data) {
    if (obj.queueType === 'RANKED_SOLO_5x5') {
      return obj;
    }
  }
  return null; // Return null if no object with the specified queueType is found
}

function getRegionBaseUrl(region:string) {
  switch (region) {
      case 'NA1': return 'https://na1.api.riotgames.com';
      case 'EUW1': return 'https://euw1.api.riotgames.com';
      case 'BR1': return 'https://br1.api.riotgames.com';
      case 'EUN1': return 'https://eun1.api.riotgames.com';
      case 'JP1': return 'https://jp1.api.riotgames.com';
      case 'KR': return 'https://kr.api.riotgames.com';
      case 'LA1': return 'https://la1.api.riotgames.com';
      case 'LA2': return 'https://la2.api.riotgames.com';
      case 'OC1': return 'https://oc1.api.riotgames.com';
      case 'TR1': return 'https://tr1.api.riotgames.com';
      case 'RU': return 'https://ru.api.riotgames.com';
      case 'PH2': return 'https://ph2.api.riotgames.com';
      case 'SG2': return 'https://sg2.api.riotgames.com';
      case 'TH2': return 'https://th2.api.riotgames.com';
      case 'TW2': return 'https://tw2.api.riotgames.com';
      case 'VN2': return 'https://vn2.api.riotgames.com';
      default: return 'https://na1.api.riotgames.com';
  }
}