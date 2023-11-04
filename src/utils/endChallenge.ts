import { getInfo } from "../services/getInfo";
import { client } from "../database/config";

export async function initEndChallengeTasks() {
    try {
        await client.connect();
        const db = client.db("LoLRushDB");
        const collection = db.collection("Page");
        const cursor = collection.find();
        console.log("There is "+ await collection.countDocuments() + " documents in the database");

        await cursor.forEach(async (document: any) => {
            console.log("Document with code " + document.code + " is processing...");

            if (!document.finished) {
                const currentDateTime = new Date();
                const challengeEndDate = new Date(document.challengeEndDate);

                if (challengeEndDate <= currentDateTime) {
                    await endChallenge(document.code);
                    console.log("Challenge with code " + document.code + " has ended");
                    // Introduce a delay of 10 seconds between processing each document
                    console.log("Waiting 10 seconds before processing the next document...");
                    await new Promise((resolve) => setTimeout(resolve, 10000));
                    console.log("Done waiting");
                } else {
                    const timeUntilEnd = challengeEndDate.getTime() - currentDateTime.getTime();
                    setTimeout(() => {
                        (async () => {
                            await endChallenge(document.code);
                        })();
                    }, timeUntilEnd);
                    console.log("Challenge with code " + document.code + " will end in " + timeUntilEnd + " milliseconds");
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