import express from 'express';

import { createChallenge } from '../services/createTemporaryPage';

export const createTemporaryPageController = async (req: express.Request, res: express.Response) => {
    try{
        console.log('Request body:', req.body);
        const { email, player_1, player_2, player_3, player_4,player_5,player_6,player_7,player_8, region, daysUntilExpiration } = req.body;
        if(!email || !player_1 || !player_2 || !region || !daysUntilExpiration ){
            return res.status(400).json({message: 'Bad Request, one or more of the required fields are missing'});
        } 
        else if ( daysUntilExpiration < 1 || daysUntilExpiration > 14){
            return res.status(400).json({message: 'Bad Request, daysUntilExpiration must be between 1 and 14'});
        } 
        else {
            let player_usernames: string[] = [];
            // Take the values of player_1 up to player_8 if the values are not equals to undefined add them in an array called player_usernames
            if(player_1 !== undefined) player_usernames.push(player_1);
            if(player_2 !== undefined) player_usernames.push(player_2);
            if(player_3 !== undefined || player_3 !== '') player_usernames.push(player_3);
            if(player_4 !== undefined || player_4 !== '') player_usernames.push(player_4);
            if(player_5 !== undefined || player_5 !== '') player_usernames.push(player_5);
            if(player_6 !== undefined || player_6 !== '') player_usernames.push(player_6);
            if(player_7 !== undefined || player_7 !== '') player_usernames.push(player_7);
            if(player_8 !== undefined || player_8 !== '') player_usernames.push(player_8);
            // Call the createTemporaryPage function and pass the array of player_usernames, region and daysUntilExpiration 
            const result = await createChallenge(email, player_usernames, region, daysUntilExpiration);
            return res.status(200).json(result);
        }   
    }
    catch(err){
        console.log(err);
        return res.status(500);
    }
}
