import express from 'express';

const router = express.Router();

import getInfo from './getInfo';
import createTemporaryPage from './createTemporaryPage';

export default (): express.Router => {
  getInfo(router);
  createTemporaryPage(router);
  return router;
};