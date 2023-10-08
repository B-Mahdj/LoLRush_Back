import express from 'express';

import { getInfo } from '../services/getInfo';

export const getInfoController = async (req: express.Request, res: express.Response) => {
    try{
        // Get code from param in the url
        let code = req.query.code;
        if(!code){
            return res.status(400).json({message: 'Bad Request, one or more of the required fields are missing'});
        }
        else {
            code = code.toString();
            const result = await getInfo(parseInt(code));
            return res.status(200).json(result);
        }
    }
    catch(err){
        console.log(err);
        return res.status(500);
    }
}