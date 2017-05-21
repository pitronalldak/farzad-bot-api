'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _cookieParser = require('cookie-parser');

var _cookieParser2 = _interopRequireDefault(_cookieParser);

var _expressValidator = require('express-validator');

var _expressValidator2 = _interopRequireDefault(_expressValidator);

var _config = require('./config.json');

var _config2 = _interopRequireDefault(_config);

var _survey = require('./rest-api/survey');

var _survey2 = _interopRequireDefault(_survey);

var _question = require('./rest-api/question');

var _question2 = _interopRequireDefault(_question);

var _user = require('./rest-api/user');

var _user2 = _interopRequireDefault(_user);

var _survey3 = require('./services/survey');

var _survey4 = _interopRequireDefault(_survey3);

var _question3 = require('./services/question');

var _question4 = _interopRequireDefault(_question3);

var _user3 = require('./services/user');

var _user4 = _interopRequireDefault(_user3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var port = process.env.PORT || 5000;

var app = (0, _express2.default)();
app.server = _http2.default.createServer(app);

var corsOptions = {
    origin: ['http://localhost:3000', 'https://survey-dashboard.herokuapp.com'],
    optionsSuccessStatus: 200,
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

app.use(_bodyParser2.default.json({
    limit: _config2.default.bodyLimit
}));
app.use((0, _cookieParser2.default)());

app.use((0, _cors2.default)(corsOptions));

app.use((0, _expressValidator2.default)({
    errorFormatter: function errorFormatter(param, msg, value) {
        var namespace = param.split('.');
        var root = namespace.shift();
        var formParam = root;

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

connect().on('error', console.log).on('disconnected', connect).once('open', listen);

function connect() {
    var options = { server: { socketOptions: { keepAlive: 1 } } };
    return _mongoose2.default.connect('mongodb://bot:Matwey12@ds145019.mlab.com:45019/heroku_zlrrx207').connection;
    // return mongoose.connect('mongodb://bot:bot@127.0.0.1:27017/bot').connection;
}

function listen() {
    if (app.get('env') === 'test') return;
    app.listen(port);
    console.log('Express app started on port ' + port);
}

new _survey2.default(app, new _survey4.default()).register();
new _question2.default(app, new _question4.default()).register();
new _user2.default(app, new _user4.default()).register();

exports.default = app;
//# sourceMappingURL=index.js.map