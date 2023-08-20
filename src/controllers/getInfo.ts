import express from 'express';

import { getInfo } from '../services/getInfo';

export const getInfoController = async (req: express.Request, res: express.Response) => {
    try{
        const { player_usernames, date, region } = req.body;
        if(!player_usernames || !region){
            return res.status(400).json({message: 'Bad Request, one or more of the required fields are missing'});
        }
        else if (player_usernames.length < 2 || player_usernames.length > 8){
            return res.status(400).json({message: 'Bad Request, player_usernames must be between 2 and 8'});
        }
        else {
            const result = await getInfo(player_usernames, date, region);
            return res.status(200).json(result);
        }
    }
    catch(err){
        console.log(err);
        return res.status(500);
    }
}