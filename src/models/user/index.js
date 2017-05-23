import mongoose from 'mongoose';

import Model from '../model';

const ObjectIdSchema = mongoose.Schema.ObjectId;
const ObjectId = mongoose.Types.ObjectId;


const UserSchema = new mongoose.Schema({
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

const UserBOSchema = new mongoose.Schema({
    email: {type: String, required: true},
    password: {type: String, required: true},
    accessToken: {type: String},
});

UserSchema.set('toJSON', {
    transform: function (doc, ret) {
        delete ret._id;
        delete ret.__v;
    },
});

UserBOSchema.set('toJSON', {
    transform: function (doc, ret) {
        delete ret._id;
        delete ret.__v;
    },
});

const User = mongoose.model('User', UserSchema);
const UserBO = mongoose.model('UserBO', UserBOSchema);

/**
 * Service level class with methods for user.
 */
export default class UserModel {
    constructor() {
        this.model = new Model(User);
        this.modelBO = new Model(UserBO);
    }
    
    getUser(criteria) {
        return this.model.select(criteria, {limit: 1});
    }
    
    getUserBO(criteria) {
        return this.modelBO.select(criteria, {limit: 1});
    }
    
    updateUserBO(criteria, update) {
        return this.modelBO.update(criteria, update);
    }
    
    getAll() {
        return this.model.select({});
    }
    
    removeQuestion(id) {
        return (
            this.model.select({})
                .then(users => {
                    const promises = [];
                    users.forEach(u => {
                        const answers = u.answers;
                        const answer = answers.find(a => a.questionId === id);
                        if (answer) {
                            answer.isDeleted = true;
                            promises.push(this.model.update({telegramId: u.telegramId}, {answers}));
                        }
                    });
                    Promise.all(promises);
                })
        )
    }
    
    removeSurvey(id) {
        return (
            this.model.select({})
                .then(users => {
                    const promises = [];
                    users.forEach(u => {
                        if (u.survey === id) {
                            const answers = u.answers;
                            answers.forEach(a => {
                                a.isDeleted = true;
                            });
                            promises.push(this.model.update({telegramId: u.telegramId}, {answers}));
                        }
                    });
                    Promise.all(promises);
                })
        )
    }
    
    createQuestion(id, question, survey) {
        return (
            this.model.select({})
                .then(users => {
                    const promises = [];
                    users.forEach(u => {
                        if (u.survey === survey) {
                            const answers = u.answers;
                            answers.push({answer: '', questionId: id, question: question });
                            promises.push(this.model.update({telegramId: u.telegramId}, {answers}));
                        }
                    });
                    Promise.all(promises);
                })
        )
    }
}

