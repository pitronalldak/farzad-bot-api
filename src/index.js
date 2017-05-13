import http from 'http';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import expressValidator from 'express-validator';
import session from 'express-session';

import config from './config.json';

import SurveyApi from './rest-api/survey';
import QuestionApi from './rest-api/question';

import SurveyService from './services/survey';
import QuestionService from './services/question';

const port = process.env.PORT || 5000;

let app = express();
app.server = http.createServer(app);

app.use(cors());

app.use(bodyParser.json({
	limit : config.bodyLimit
}));

app.use(session({
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: 'shhhh, very secret',
    cookie: { secure: true }
}));

app.use(expressValidator({
    errorFormatter: (param, msg, value) => {
        const namespace = param.split('.');
        const root    = namespace.shift();
        let formParam = root;

        while(namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param : formParam,
            msg   : msg,
            value : value
        };
    }
}));

connect()
  .on('error', console.log)
  .on('disconnected', connect)
  .once('open', listen);

function connect () {
  const options = { server: { socketOptions: { keepAlive: 1 } } };
  return mongoose.connect('mongodb://bot:Matwey12@ds145019.mlab.com:45019/heroku_zlrrx207').connection;
  // return mongoose.connect('mongodb://bot:bot@127.0.0.1:27017/bot').connection;
}

function listen () {
  if (app.get('env') === 'test') return;
  app.listen(port);
  console.log('Express app started on port ' + port);
}

new SurveyApi(app, new SurveyService()).register();
new QuestionApi(app, new QuestionService()).register();

export default app;
