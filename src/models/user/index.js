import mongoose from 'mongoose';

import Model from '../model';

const ObjectIdSchema = mongoose.Schema.ObjectId;
const ObjectId = mongoose.Types.ObjectId;


const UserSchema = new Schema({
    date: {type: String, default: ''},
    username: {type: String, default: ''},
    telegramId: {type: String, default: ''},
    chatId: {type: String, default: ''},
    answers: [{
        answerId: {type: String, default: ''},
        question: {type: String, default: ''},
        questionId: {type: String, default: ''},
        answer: {type: String, default: ''}
    }]
});


UserSchema.set('toJSON', {
    transform: function (doc, ret) {
        delete ret._id;
        delete ret.__v;
    },
});

const User = mongoose.model('User', UserSchema);

/**
 * Service level class with methods for user.
 */
export default class SurveyModel {
    constructor() {
        this.model = new Model(User);
    }
    
    getAll() {
        return this.model.select({});
    }
}

