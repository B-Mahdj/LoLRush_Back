import express from 'express';
import { checkUsername } from '../services/checkUsername';
export const checkUsernameController = async (req: express.Request, res: express.Response) => {
    try{
        console.log('Request body:', req.body);
        const { player_username, region } = req.body;
        if(!player_username || !region){
            return res.status(400).json({message: 'Bad Request, one or more of the required fields are missing'});
        }  
        else {
            const result = await checkUsername(player_username, region);
            if(result === true){
                return res.status(200).json({message: 'Username exists'});
            }
            else {
                return res.status(404).json({message: 'Username does not exist'});
            }
        }   
    }
    catch(err){
        console.log(err);
        return res.status(500);
    }
}