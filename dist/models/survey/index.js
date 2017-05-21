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

var SurveySchema = new _mongoose2.default.Schema({
    id: { type: String, default: '' },
    name: { type: String, default: '' },
    thankYou: { type: String, default: '' },
    isActive: { type: Boolean, default: true }
});

SurveySchema.set('toJSON', {
    transform: function transform(doc, ret) {
        delete ret._id;
        delete ret.__v;
    }
});

var Survey = _mongoose2.default.model('Survey', SurveySchema);

/**
 * Service level class with methods for surveys.
 */

var SurveyModel = function () {
    function SurveyModel() {
        _classCallCheck(this, SurveyModel);

        this.model = new _model2.default(Survey);
    }

    _createClass(SurveyModel, [{
        key: 'getAll',
        value: function getAll() {
            return this.model.select({});
        }
    }, {
        key: 'create',
        value: function create(survey) {
            return this.model.create(survey);
        }
    }, {
        key: 'update',
        value: function update(survey) {
            var criteria = { id: survey.id };
            delete survey.id;

            var update = survey;
            return this.model.update(criteria, update);
        }
    }, {
        key: 'remove',
        value: function remove(id) {
            var criteria = { id: id };
            return this.model.remove(criteria);
        }
    }, {
        key: 'activate',
        value: function activate(data) {
            var criteria = { id: data.id };
            var update = { isActive: data.isActive };
            return this.model.update(criteria, update);
        }
    }]);

    return SurveyModel;
}();

exports.default = SurveyModel;
//# sourceMappingURL=index.js.map