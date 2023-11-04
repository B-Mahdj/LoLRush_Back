import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import router from './router';
import cors from 'cors';
import { initEndChallengeTasks } from './utils/endChallenge';

require('dotenv').config();
const app = express();

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(cors());

const server = http.createServer(app);

server.listen(8080, () => {
    console.log('Server listening on port 8080');
});

app.use('/', router());

initEndChallengeTasks();