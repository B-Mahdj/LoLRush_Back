import { getInfo } from "../services/getInfo";
import { client } from "../database/config";

export async function initEndChallengeTasks() {
    try {
        await client.connect();
        const db = client.db("LoLRushDB");
        const collection = db.collection("Page");
        const cursor = collection.find();
        console.log("There is " + await collection.countDocuments() + " documents in the database");

        await cursor.forEach(async (document: any) => {
            // ... (Your existing code)

            if (!document.finished) {
                const currentDateTime = new Date();
                const challengeEndDate = new Date(document.challengeEndDate);

                if (challengeEndDate <= currentDateTime) {
                    await endChallenge(document.code);
                    // ... (Your existing code with delay)
                } else {
                    const timeUntilEnd = challengeEndDate.getTime() - currentDateTime.getTime();
                    const delay = Math.min(timeUntilEnd, 2_147_483_647); // Cap the delay to maximum value of 32-bit signed integer

                    if (timeUntilEnd > 2_147_483_647) {
                        const remainingTime = timeUntilEnd - delay;
                        let iterations = Math.ceil(remainingTime / 2_147_483_647);

                        for (let i = 0; i < iterations; i++) {  
                            setTimeout(async () => {
                                await endChallenge(document.code);
                            }, 2_147_483_647 * (i + 1));
                        }
                    }

                    setTimeout(async () => {    
                        await endChallenge(document.code);
                    }, delay);
                }
            }
        });
        console.log("Done processing all documents");
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
    }
}


export async function endChallenge(code: number) {
    try {
        const challengeData = await getInfo(code);
        const players_info = challengeData.players_info;

        await client.connect();
        const db = client.db("LoLRushDB");
        const collection = db.collection("Page");

        let result = await collection.updateOne(
            { code: code },
            {
                $set: {
                    final_players_info: players_info,
                    finished: true,
                },
            },
            { upsert: true }
        );

        console.log(
            `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`
        );
    }
    finally {
        client.close();
    }
}