'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Rest level class with methods for authorization.
 */
var UserApi = function UserApi(app, service) {
    var _this = this;

    _classCallCheck(this, UserApi);

    this.register = function () {
        _this.app.get('/users/bo', function (req, res) {
            return _this.service.getUser(req, res);
        });
        _this.app.get('/users/logout', function (req, res) {
            return _this.service.logout(req, res);
        });
        _this.app.post('/users/sign-up', function (req, res) {
            return _this.service.createUser(req, res);
        });
        _this.app.post('/users/login', function (req, res) {
            return _this.service.login(req, res);
        });
    };

    this.app = app;
    this.service = service;
}

/**
 * Authorization routes list
 */
;

exports.default = UserApi;
//# sourceMappingURL=index.js.map