import { endChallenge } from '../utils/endChallenge';
import { client } from '../database/config';
require('dotenv').config();

export async function createChallenge(email: string, player_usernames: string[], region: string, challengeDurationDays: number): Promise<number | null> {
  try {
    await client.connect();
    const db = client.db("LoLRushDB");
    const collection = db.collection("Page");

    // Generate a code that is of 6 digits long and is unique to the page
    let code: number = Math.floor(100000 + Math.random() * 900000);

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + challengeDurationDays);

    const newPage = {
      email: email,
      player_usernames: player_usernames,
      region: region,
      challengeEndDate: endDate,
      code: code,
      finished: false,
    };

    // Insert the new page document
    await collection.insertOne(newPage);
    console.log('Document inserted:', newPage);

    // Schedule the end of challenge
    const timeout = (endDate.getTime() - Date.now());
    setTimeout(() => {
      (async () => {
        await endChallenge(code, collection);
      })();
    }, timeout);

    console.log('Challenge will end in', timeout, 'ms');
    
    return code;
  } catch (err) {
    console.error('Error:', err);
  }
  finally {
    await client.close();
  }

}