/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const moment = require('moment');
const { wrap: async } = require('co');

import QuestionModel from '../../models/question';
import UserModel from '../../models/user';

let regeneratorRuntime =  require("regenerator-runtime");

const Question = new QuestionModel();
const User = UserModel;


exports.createQuestion = async(function* (text, ownAnswer) {
    const data = {};
    let preData = text.split('{');
    data.question = preData[0];

    if (preData[1]) {
        preData = preData[1].split('}')[0].split('/');
    } else {
        preData = [];
    }
    data.id = Math.random();
    data.answers = [];

    if (ownAnswer) data.ownAnswer = {text: ownAnswer, id: 0};
    preData.forEach((a, key) => data.answers.push({id: key + 1, text: a}));
    
    this.getUsers()
        .then((users) => {
            for (let user of users) {
                user.answers.push({"answer":"","questionId": data.id,"question": data.question});
                user.save();
            }
        });

    try {
        Question.create(data);
    } catch (err) {

        const errors = Object.keys(err.errors)
            .map(field => err.errors[field].message);

    }
});

exports.getQuestions = async(function* () {
    return Question.getAll();
});

exports.getUsers = async(function* () {
    return User.getAll();
});

// exports.removeQuestions = async(function* () {
//     return Question.remove();
// });

// exports.findTheQuestion = async(function* (question) {
//     let q = question;
//     return Question.getQuestionByName(q);
// });

// exports.removeTheQuestion = async(function* (question) {
//     Question.removeQuestionByName(question);
// });

exports.getUser = async(function* (telegramId) {
    return User.getUser({telegramId: telegramId});
});

exports.createUser = async(function* (data) {
    Question.list()
        .then(questions => {
            const userData = {
                date: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
                username: data.from.username,
                telegramId: data.from.id,
                chatId: data.chat.id,
                answers: []
            };

            User.getUser({telegramId: data.from.id})
                .then(user => {
                    if (user) {
                        user.answers = [];
                        user.date = moment().format('YYYY-MM-DDTHH:mm:ssZ');
                        questions.forEach(q => user.answers.push({question: q.question, questionId: q.id}));
                        user.chatId = userData.chatId;
                        return user.save();
                    } else {
                        questions.forEach(q => userData.answers.push({question: q.question, questionId: q.id}));
                        return User.create(userData);
                    }
                });
        })
});

exports.putAnswer = async(function* (telegramId, question, answer, answerId) {

    User.getUser({telegramId: data.from.id})
        .then(user => {
            user.answers.find(a => a.question === question).answer = answer;
            user.answers.find(a => a.question === question).answerId = answerId;
            return User.update({telegramId: user.telegramId}, user);
        });
});