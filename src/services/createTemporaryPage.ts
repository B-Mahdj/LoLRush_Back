import { client } from '../database/config';
require('dotenv').config();

export async function createChallenge(email:string, player_usernames:string[], region:string, challengeDurationDays:number): Promise<number | null> {
    try {
        await client.connect();
        const db = client.db("LoLRushDB");
        const collection = db.collection("Page");

        // Using the MongoDb Atlas database, look at the Page collection and find the highest unique _id and add 1 to it    
        // If the pages collection is empty, set the unique id to 0 

        let highestId: number = await getNumbersOfDocuments(collection);
        console.log('Highest id:', highestId)
        let nextUniqueId:string = (++highestId).toString();
        console.log('Next unique id:', nextUniqueId)
        // Generate a code that is of 6 digits long and is unique to the page
        let code:number = Math.floor(100000 + Math.random() * 900000);

        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + challengeDurationDays);

        const newPage = {
          _id: nextUniqueId,
          email: email,
          player_usernames: player_usernames,
          region: region,
          challengeEndDate: endDate,
          code: code
        };
    
        // Insert the new page document
        await collection.insertOne(newPage);
        console.log('Document inserted:', newPage);
        
        client.close();
        return code;
    } catch (err) {
      console.error('Error:', err);
    }

}

// Function to find the highest _id in the collection
async function getNumbersOfDocuments(collection: any): Promise<number | null> {
  try {
      const count = await collection.countDocuments();
      console.log('Count of document:', count);
      return count;
  } catch (error) {
      console.error('Error:', error);
      return null;
  }
}