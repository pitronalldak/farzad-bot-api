'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _user = require('../models/user');

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var util = require('util');

var Service = function Service() {
    var _this = this;

    _classCallCheck(this, Service);

    this.validation = function (req) {
        req.getValidationResult().then(function (error) {
            if (!error.isEmpty()) {
                return res.status(400).send('There have been validation errors: ' + util.inspect(error.array()));
            }
        });
    };

    this.validateSession = function (req, res) {
        var accessToken = req.cookies.accessToken;

        if (!accessToken) {
            res.status(400).send("Invalid password");
        }

        _this.model.get({ accessToken: req.body.accessToken }).then(function (user) {
            if (!user) {
                res.status(401);
            } else {
                return user;
            }
        });
    };

    this.model = new _user2.default();
};

exports.default = Service;
//# sourceMappingURL=service.js.map