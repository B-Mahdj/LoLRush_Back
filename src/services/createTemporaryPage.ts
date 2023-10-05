import { client } from '../database/config';
require('dotenv').config();

export async function createChallenge(email:string, player_usernames:string[], region:string, daysUntilExpiration:number): Promise<number | null> {
    try {
        await client.connect();
        const db = client.db("LoLRushDB");
        const collection = db.collection("Page");

        // Using the MongoDb Atlas database, look at the Page collection and find the highest unique _id and add 1 to it    
        // If the pages collection is empty, set the unique id to 0 

        let highestId: number = await findHighestId(collection);
        console.log('Highest id:', highestId)
        let nextUniqueId:string = (++highestId).toString();
        console.log('Next unique id:', nextUniqueId)
        // Generate a code that is of 6 digits long and is unique to the page
        let code:number = Math.floor(100000 + Math.random() * 900000);

        // Create a new page document with the calculated unique id
        const newPage = {
            _id: nextUniqueId,
            email: email,
            player_usernames: player_usernames,
            region: region,
            daysUntilExpiration: daysUntilExpiration,
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
async function findHighestId(collection:any): Promise<number | null> {
    try {
        const result = await collection
        .find()
        .sort({ _id: -1 })
        .limit(1)
        .toArray();
  
      client.close();
  
      if (result.length > 0) {
        const highestId = result[0]._id;
        return highestId;
      } else {
        return 0;
      }
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
}