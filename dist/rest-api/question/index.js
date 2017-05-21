'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Rest level class with methods for Questions.
 */
var QuestionApi = function QuestionApi(app, service) {
    var _this = this;

    _classCallCheck(this, QuestionApi);

    this.register = function () {
        _this.app.post('/questions', function (req, res) {
            return _this.service.getAll(req, res);
        });
        _this.app.post('/questions/create', function (req, res) {
            return _this.service.create(req, res);
        });
        _this.app.put('/questions/update', function (req, res) {
            return _this.service.update(req, res);
        });
        _this.app.post('/questions/remove', function (req, res) {
            return _this.service.remove(req, res);
        });
        _this.app.post('/questions/order', function (req, res) {
            return _this.service.getOrder(req, res);
        });
        _this.app.put('/questions/order', function (req, res) {
            return _this.service.updateOrder(req, res);
        });
    };

    this.app = app;
    this.service = service;
}

/**
 * Questions routes list
 */
;

exports.default = QuestionApi;
//# sourceMappingURL=index.js.map