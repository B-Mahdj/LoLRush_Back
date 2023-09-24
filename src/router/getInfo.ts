import express from 'express';

import { getInfoController } from '../controllers/getInfo';

export default (router: express.Router) => {
  router.get('/page', getInfoController);
};