import http from 'http';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import expressValidator from 'express-validator';

import config from './config.json';

import SurveyApi from './rest-api/survey';
import QuestionApi from './rest-api/question';
import UserApi from './rest-api/user';

import SurveyService from './services/survey';
import QuestionService from './services/question';
import UserService from './services/user';

const fs = require('fs');
const https = require('https');

const hskey = fs.readFileSync('./sslcert/coinSurvey-key.pem');
const hscert = fs.readFileSync('./sslcert/coinSurvey-cert.pem');

const serverOptions = {
  key: hskey,
  cert: hscert
};

const port = process.env.PORT || 80;
const host = 'coinsurvey.me';

require("./telegram");

require("./facebook");

require("./messages/bot_app/models");

const PASSWORD = 'Survey2017';

let app = express();

app.server = https.createServer(serverOptions, app);

const corsOptions = {
    origin: ['http://localhost:3000', 'https://survey-dashboard.herokuapp.com', 'http://174.138.52.48:3000', 'http://174.138.52.48'],
    optionsSuccessStatus: 200,
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};


app.use(bodyParser.json({
    limit: config.bodyLimit
}));
app.use(cookieParser());

app.use(cors(corsOptions));

app.use(expressValidator({
    errorFormatter: (param, msg, value) => {
        const namespace = param.split('.');
        const root = namespace.shift();
        let formParam = root;
        
        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

connect()
    .on('error', console.log)
    .on('disconnected', connect)
    .once('open', listen);

function connect() {
    const options = {server: {socketOptions: {keepAlive: 1}}};
    // return mongoose.connect('mongodb://bot:Matwey12@ds145019.mlab.com:45019/heroku_zlrrx207').connection;
    return mongoose.connect('mongodb://bot:bot@127.0.0.1:27017/bot').connection;
}

function listen() {
    if (app.get('env') === 'test') return;
    app.listen(port, host);
    console.log('Express app started on port ' + port);
}

new SurveyApi(app, new SurveyService()).register();
new QuestionApi(app, new QuestionService()).register();
new UserApi(app, new UserService()).register();

export default app;

import {botFacebook} from './facebook'

app.get('/facebook', (req, res) => {
  return botFacebook._verify(req, res)
})

app.post('/facebook', (req, res) => {
  botFacebook._handleMessage(req.body)
  res.end(JSON.stringify({status: 'ok'}))
})
