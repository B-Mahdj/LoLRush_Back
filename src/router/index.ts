import express from 'express';

import getInfo from './getInfo';
import createTemporaryPage from './createTemporaryPage';
import checkUsername from './checkUsername';

const router = express.Router();

export default (): express.Router => {
  getInfo(router);
  createTemporaryPage(router);
  checkUsername(router);
  return router;
};