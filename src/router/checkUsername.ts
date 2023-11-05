import { checkUsernameController } from '../controllers/checkUsername';
import express from 'express';

export default (router: express.Router) => {
    router.post('/check_username', checkUsernameController);
};