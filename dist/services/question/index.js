'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _service = require('../service');

var _service2 = _interopRequireDefault(_service);

var _question = require('../../models/question');

var _question2 = _interopRequireDefault(_question);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var uuidV4 = require('uuid/v4');

/**
 * Service level class with methods for questions.
 */

var QuestionService = function (_Service) {
    _inherits(QuestionService, _Service);

    function QuestionService() {
        _classCallCheck(this, QuestionService);

        var _this = _possibleConstructorReturn(this, (QuestionService.__proto__ || Object.getPrototypeOf(QuestionService)).call(this));

        _this.model = new _question2.default();
        return _this;
    }

    /**
     * Method for request all questions.
     *
     * @param {String} req request from client
     * @param {String} res response to client
     * @return {Promise} promise
     */


    _createClass(QuestionService, [{
        key: 'getAll',
        value: function getAll(req, res) {

            return this.model.getAll(req.body).then(function (data) {
                res.json({ data: data });
            }).catch(function (error) {
                res.status(400).send(JSON.stringify({ err: error.message || error }));
            });
        }
    }, {
        key: 'create',


        /**
         * Method for create question .
         *
         * @param {String} req request from client
         * @param {String} res response to client
         * @return {Promise} promise
         */
        value: function create(req, res) {

            var id = uuidV4();
            req.body.id = id;
            return this.model.create(req.body).then(function () {
                res.json({ id: id });
            }).catch(function (error) {
                res.status(400).send(JSON.stringify({ err: error.message || error }));
            });
        }
    }, {
        key: 'update',


        /**
         * Method for update question .
         *
         * @param {String} req request from client
         * @param {String} res response to client
         * @return {Promise} promise
         */
        value: function update(req, res) {
            // req.assert('password', 'required').notEmpty();
            // req.assert('password', '6 to 20 characters required').len(6, 20);
            // req.assert('email', 'valid email required').isEmail();
            // req.assert('email', 'required').notEmpty();
            // this.validation(req);


            return this.model.update(req.body).then(function () {
                res.status(200).send(JSON.stringify({ msg: "Question updated" }));
            }).catch(function (error) {
                res.status(400).send(JSON.stringify({ err: error.message || error }));
            });
        }
    }, {
        key: 'remove',


        /**
         * Method for delete question .
         *
         * @param {String} req request from client
         * @param {String} res response to client
         * @return {Promise} promise
         */
        value: function remove(req, res) {
            // req.assert('password', 'required').notEmpty();
            // req.assert('password', '6 to 20 characters required').len(6, 20);
            // req.assert('email', 'valid email required').isEmail();
            // req.assert('email', 'required').notEmpty();
            // this.validation(req);


            return this.model.remove(req.body.id).then(function () {
                res.status(200).send(JSON.stringify({ msg: "Question deleted" }));
            }).catch(function (error) {
                res.status(400).send(JSON.stringify({ err: error.message || error }));
            });
        }
    }, {
        key: 'getOrder',


        /**
         * Method for request questions order.
         *
         * @param {String} req request from client
         * @param {String} res response to client
         * @return {Promise} promise
         */
        value: function getOrder(req, res) {

            return this.model.getOrder(req.body.surveyId).then(function (data) {
                res.json({ data: data });
            }).catch(function (error) {
                res.status(400).send(JSON.stringify({ err: error.message || error }));
            });
        }
    }, {
        key: 'updateOrder',


        /**
         * Method for request questions order.
         *
         * @param {String} req request from client
         * @param {String} res response to client
         * @return {Promise} promise
         */
        value: function updateOrder(req, res) {

            return this.model.updateOrder(req.body).then(function () {
                res.status(200).send(JSON.stringify({ msg: "Order updated" }));
            }).catch(function (error) {
                res.status(400).send(JSON.stringify({ err: error.message || error }));
            });
        }
    }]);

    return QuestionService;
}(_service2.default);

exports.default = QuestionService;
//# sourceMappingURL=index.js.map