'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Rest level class with methods for Surveys.
 */
var SurveyApi = function SurveyApi(app, service) {
    var _this = this;

    _classCallCheck(this, SurveyApi);

    this.register = function () {
        _this.app.get('/surveys', function (req, res) {
            return _this.service.getAll(req, res);
        });
        _this.app.get('/surveys/google', function (req, res) {
            return _this.service.handleGoogle(req, res);
        });
        _this.app.get('/surveys/no-answers.', function (req, res) {
            return _this.service.handleNoAnswers(req, res);
        });
        _this.app.post('/surveys/create', function (req, res) {
            return _this.service.create(req, res);
        });
        _this.app.put('/surveys/update', function (req, res) {
            return _this.service.update(req, res);
        });
        _this.app.post('/surveys/remove', function (req, res) {
            return _this.service.remove(req, res);
        });
        _this.app.put('/surveys/activate', function (req, res) {
            return _this.service.activate(req, res);
        });
    };

    this.app = app;
    this.service = service;
}

/**
 * Surveys routes list
 */
;

exports.default = SurveyApi;
//# sourceMappingURL=index.js.map