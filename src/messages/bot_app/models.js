import {QuestionSchema} from '../../models/question';
import {UserSchema} from '../../models/user';

QuestionSchema.methods = {
    remove: function () {
        return this.remove()
            .exec();
    }
};

QuestionSchema.statics = {

    getQuestionByName: function (question) {
        return (this.findOne({question}));
    },
    removeQuestionByName: function (question) {
        return this.findOne({question}).remove()
            .exec();
    },
    list: function (options) {
        return this.find()
            .exec();
    }
};

UserSchema.statics = {

    /**
     * List questions
     *
     * @param {Object} telegramId
     * @api private
     */

    getUserById: function (telegramId) {
        return this.findOne({telegramId})
            .exec();
    },
    list: function (options) {
        return this.find()
        .exec();
    }
};
