import express from 'express';

import { createTemporaryPageController } from '../controllers/createTemporaryPage';

export default (router: express.Router) => {
  router.post('/create_temporary_page', createTemporaryPageController);
};