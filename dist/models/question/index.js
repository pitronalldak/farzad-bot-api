'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _model = require('../model');

var _model2 = _interopRequireDefault(_model);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ObjectIdSchema = _mongoose2.default.Schema.ObjectId;
var ObjectId = _mongoose2.default.Types.ObjectId;

var QuestionSchema = new _mongoose2.default.Schema({
    id: { type: String, default: '' },
    index: { type: Number, default: '' },
    survey: { type: String },
    type: { type: String, default: 'ownAndOptions' },
    question: { type: String, default: '' },
    answers: { type: [] },
    ownAnswer: {
        id: { type: String, default: '' },
        text: { type: String, default: '' }
    }
});

QuestionSchema.set('toJSON', {
    transform: function transform(doc, ret) {
        delete ret._id;
        delete ret.__v;
    }
});

var Question = _mongoose2.default.model('Question', QuestionSchema);

/**
 * Service level class with methods for questions.
 */

var QuestionModel = function () {
    function QuestionModel() {
        _classCallCheck(this, QuestionModel);

        this.model = new _model2.default(Question);
    }

    _createClass(QuestionModel, [{
        key: 'getAll',
        value: function getAll(survey) {
            return this.model.select(survey, { sortKey: 'index', sort: 1 });
        }
    }, {
        key: 'create',
        value: function create(question) {
            return this.model.create(question);
        }
    }, {
        key: 'update',
        value: function update(question) {
            var criteria = { id: question.id };
            delete question.id;

            var update = question;
            return this.model.update(criteria, update);
        }
    }, {
        key: 'remove',
        value: function remove(id) {
            var criteria = { id: id };
            return this.model.remove(criteria);
        }
    }, {
        key: 'getOrder',
        value: function getOrder(surveyId) {
            return this.model.select({ survey: surveyId }, { sortKey: 'index', sort: 1 }, { index: 1, id: 1 });
        }
    }, {
        key: 'updateOrder',
        value: function updateOrder(order) {
            var _this = this;

            var request = order.map(function (o) {
                return _this.model.update({ id: o.id }, { index: o.index });
            });
            return Promise.all(request);
        }
    }]);

    return QuestionModel;
}();

exports.default = QuestionModel;
//# sourceMappingURL=index.js.map