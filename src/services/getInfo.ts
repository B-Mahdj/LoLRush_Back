import axios from 'axios';
import { ChallengeData, PlayerInfo, Rank } from '../types/defaut_types';
import { riot_api_config } from '../utils/header_api_riot';
import { comparePlayerInfos } from '../utils/compareRanks';
import { getRegionBaseUrl } from '../utils/getRegionBaseUrl';
import { client } from '../database/config';
import fs from 'fs';


export async function getInfo(code: number): Promise<ChallengeData> {
  console.log('Code:', code);

  try {
    await client.connect();
    const db = client.db('LoLRushDB');
    const collection = db.collection('Page');

    const result = await collection.findOne({ code: code });

    if (result) {
      if (result.finished) {
        console.log('Challenge already finished');
        const expiredTime = "00d:00h:00m:00s";
        const challengeData: ChallengeData = {
          timeUntilEndChallenge: expiredTime,
          players_info: result.final_players_info
        };
        return challengeData;
      }
      else {
        const player_usernames = result.player_usernames;
        const region = result.region;
        // timeUntilEndChallenge is a Date object that represents the time until the challenge ends
        const challengeEndDate = new Date(result.challengeEndDate);
        const currentTime = new Date();

        let timeUntilEndChallenge = challengeEndDate.getTime() - currentTime.getTime();
        console.log(`Time until end challenge for code : ${code}`, timeUntilEndChallenge);
        if (timeUntilEndChallenge < 0) {
          const expiredTime = "00d:00h:00m:00s";
          const challengeData: ChallengeData = {
            timeUntilEndChallenge: expiredTime,
            players_info: await getPlayerInfo(player_usernames, region)
          };
          return challengeData;
        }
        const daysRemaining = Math.floor(timeUntilEndChallenge / (1000 * 60 * 60 * 24));
        const hoursRemaining = Math.floor((timeUntilEndChallenge % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutesRemaining = Math.floor((timeUntilEndChallenge % (1000 * 60 * 60)) / (1000 * 60));
        const secondsRemaining = Math.floor((timeUntilEndChallenge % (1000 * 60)) / 1000);

        const formattedTime = `${daysRemaining.toString().padStart(2, '0')}d:${hoursRemaining.toString().padStart(2, '0')}h:${minutesRemaining.toString().padStart(2, '0')}m:${secondsRemaining.toString().padStart(2, '0')}s`;

        console.log('Player usernames:', player_usernames);
        console.log('Region:', region);
        console.log('Time until end challenge:', formattedTime);

        const challengeData: ChallengeData = {
          timeUntilEndChallenge: formattedTime,
          players_info: await getPlayerInfo(player_usernames, region)
        };
        return challengeData;
      }
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
    if (player_username.trim() !== '') {
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
    } else {
      return null; // Or handle as per your requirement for empty usernames
    }
  }).filter(player => player !== null));
  console.log('Player data:', playerData);
  playerData.sort(comparePlayerInfos);
  console.log('Sorted player data:', playerData);
  return playerData;
}


async function getPlayerStats(player_username: string, region: string): Promise<[Rank, number, number]> {
  const BASE_URL = getRegionBaseUrl(region);
  const endpoint1 = `/lol/summoner/v4/summoners/by-name/${player_username}`;
  const endpoint2 = `/lol/league/v4/entries/by-summoner`;

  try {
    // Make the first API call to get summoner data
    console.log('Making API call to:', `${BASE_URL}${endpoint1}`);
    const summonerData = await axios.get(`${BASE_URL}${endpoint1}`, riot_api_config);
    console.log('Data fetched from API call is :', summonerData.data);

    const encryptedSummonerId = summonerData.data.id;

    // Make the second API call with the encryptedSummonerId to get league data
    console.log('Making API call to:', `${BASE_URL}${endpoint2}/${encryptedSummonerId}`);
    const leagueData = await axios.get(`${BASE_URL}${endpoint2}/${encryptedSummonerId}`, riot_api_config);
    console.log('Data fetched from API call is :', leagueData.data);

    const rankedSoloQueue = findRankedSoloQueue(leagueData.data);

    const rank: Rank = rankedSoloQueue
      ? {
        tier: rankedSoloQueue.tier,
        rank: rankedSoloQueue.rank,
        leaguePoints: rankedSoloQueue.leaguePoints,
        icon: getRankIconAsBase64(rankedSoloQueue.tier)
      }
      : {
        tier: 'UNRANKED',
        rank: '',
        leaguePoints: 0,
        icon: getRankIconAsBase64('UNRANKED')
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

function findRankedSoloQueue(data: any[]): any {
  for (const obj of data) {
    if (obj.queueType === 'RANKED_SOLO_5x5') {
      return obj;
    }
  }
  return null; // Return null if no object with the specified queueType is found
}

function getRankIconAsBase64(tier: string) {
  const imagePath = `./ranks_icons/${tier.toLowerCase()}.png`;
  const base64Image = getImageAsBase64(imagePath);
  return base64Image;
}

// Function to convert image to base64
function getImageAsBase64(path: string): string {
  const image = fs.readFileSync(path);
  return Buffer.from(image).toString('base64');
};