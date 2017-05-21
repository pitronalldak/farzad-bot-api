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

var UserSchema = new _mongoose2.default.Schema({
    date: { type: String, default: '' },
    username: { type: String, default: '' },
    telegramId: { type: String, default: '' },
    chatId: { type: String, default: '' },
    answers: [{
        answerId: { type: String, default: '' },
        question: { type: String, default: '' },
        questionId: { type: String, default: '' },
        answer: { type: String, default: '' }
    }]
});

var UserBOSchema = new _mongoose2.default.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    accessToken: { type: String }
});

UserSchema.set('toJSON', {
    transform: function transform(doc, ret) {
        delete ret._id;
        delete ret.__v;
    }
});

UserBOSchema.set('toJSON', {
    transform: function transform(doc, ret) {
        delete ret._id;
        delete ret.__v;
    }
});

var User = _mongoose2.default.model('User', UserSchema);
var UserBO = _mongoose2.default.model('UserBO', UserBOSchema);

/**
 * Service level class with methods for user.
 */

var UserModel = function () {
    function UserModel() {
        _classCallCheck(this, UserModel);

        this.model = new _model2.default(User);
        this.modelBO = new _model2.default(UserBO);
    }

    _createClass(UserModel, [{
        key: 'getUserBO',
        value: function getUserBO(criteria) {
            return this.modelBO.select(criteria, { limit: 1 });
        }
    }, {
        key: 'updateUserBO',
        value: function updateUserBO(criteria, update) {
            return this.modelBO.update(criteria, update);
        }
    }, {
        key: 'getAll',
        value: function getAll() {
            return this.model.select({});
        }
    }]);

    return UserModel;
}();

exports.default = UserModel;
//# sourceMappingURL=index.js.map