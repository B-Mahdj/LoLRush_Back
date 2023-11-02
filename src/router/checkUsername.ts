import { checkUsernameController } from '../controllers/checkUsername';
import express from 'express';

export default (router: express.Router) => {
    router.get('/check_username', checkUsernameController);
};