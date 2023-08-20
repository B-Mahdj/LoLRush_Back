import express from 'express';

const router = express.Router();

import getInfo from './getInfo'

export default (): express.Router => {
  getInfo(router);

  return router;
};