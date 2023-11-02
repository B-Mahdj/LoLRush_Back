import { getInfo } from "../services/getInfo";
import { client } from "../database/config";

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