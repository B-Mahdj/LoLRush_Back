import express from 'express';

import { createTemporaryPage } from '../services/createTemporaryPage';

export const createTemporaryPageController = async (req: express.Request, res: express.Response) => {
    try{
        let fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
        console.log('Full url:', fullUrl);
        const { player_1, player_2, player_3, player_4,player_5,player_6,player_7,player_8,region, daysUntilExpiration } = req.body;
        if(!player_1 || !player_2 || !region){
            return res.status(400).json({message: 'Bad Request, one or more of the required fields are missing'});
        }  
        else {
            let player_usernames: string[] = [];
            // Take the values of player_1 up to player_8 if the values are not equals to null add them in an array called player_usernames
            if(player_1 !== null) player_usernames.push(player_1);
            if(player_2 !== null) player_usernames.push(player_2);
            if(player_3 !== null) player_usernames.push(player_3);
            if(player_4 !== null) player_usernames.push(player_4);
            if(player_5 !== null) player_usernames.push(player_5);
            if(player_6 !== null) player_usernames.push(player_6);
            if(player_7 !== null) player_usernames.push(player_7);
            if(player_8 !== null) player_usernames.push(player_8);
            // Call the createTemporaryPage function and pass the array of player_usernames, region and daysUntilExpiration 
            const result = await createTemporaryPage(player_usernames, region, daysUntilExpiration);
            return res.status(200).json(result);
        }   
    }
    catch(err){
        console.log(err);
        return res.status(500);
    }
}