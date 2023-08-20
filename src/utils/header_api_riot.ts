require('dotenv').config();
const RIOT_API_KEY = process.env.RIOT_API_KEY;

export const riot_api_config = {
    headers: {
      'X-Riot-Token': RIOT_API_KEY,
    },
};