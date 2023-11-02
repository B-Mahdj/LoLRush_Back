import axios from 'axios';
import { riot_api_config } from '../utils/header_api_riot';
import { getRegionBaseUrl } from './getInfo';

export async function checkUsername(player_username: string, region: string): Promise<boolean> {
    try {
        const BASE_URL = getRegionBaseUrl(region);
        const response = await axios.get(`${BASE_URL}/lol/summoner/v4/summoners/by-name/${player_username}`, riot_api_config);
        console.log(`Fetched user "${player_username}" data is:`, response.data);
        if(response.status === 200){
            return true;
        }
        else{
            return false;
        }
    } catch (err) {
        console.error("Error in checkUsername call", err.response.data);
        return false;
    }
}