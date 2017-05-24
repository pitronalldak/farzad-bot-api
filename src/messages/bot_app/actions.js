/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const moment = require('moment');
const { wrap: async } = require('co');
const uuid = require('uuid/v4');

import QuestionModel from '../../models/question';
import UserModel from '../../models/user';
import SurveyModel from '../../models/survey';

let regeneratorRuntime =  require("regenerator-runtime");

const Question = new QuestionModel();
const User = new UserModel();
const Survey = new SurveyModel();


exports.createQuestion = async(function* (surveyId, text, ownAnswer, questionsQuantity) {
    const data = {};
    let preData = text.split('{');
    data.question = preData[0];

    if (preData[1]) {
        preData = preData[1].split('}')[0].split('/');
    } else {
        preData = [];
    }
    data.id = uuid.v4();
	data.survey = surveyId;
    data.answers = [];
	data.index = questionsQuantity + 1;

    if (ownAnswer) {
    	data.ownAnswer = {text: ownAnswer, id: 0};
    }
    preData.forEach((a, key) => data.answers.push({id: key + 1, text: a}));
	if (data.answers.length) {
		if (data.ownAnswer) {
			data.type = 'ownAndOptions';
		} else {
			data.type = 'options';
		}
	} else {
		data.type = 'own';
	}

	return Question.create(data);
});

exports.createSurvey = async(function* (name, thankYou) {
	const data = {};
	data.id = uuid.v4();
	data.name = name;
	data.thankYou = thankYou;
	return Survey.create(data);

});

exports.initializeAddedQuestionUserAnswers = async(function* (surveyId) {
	Question.getAll()
		.then(questions => {
			this.getUsers()
				.then(users => {
					users.forEach(user => {
						if (user.survey === surveyId) {
							questions.forEach(q => {
								if (!user.answers.some(answer => answer.questionId === q.id)) {
									user.answers.push({"answer":"","questionId": q.id,"question": q.question});
									return User.update({telegramId: user.telegramId}, user);
								}
							})
						}
					})
				})
		})
});

exports.initializeUserAnswers = async(function* (surveyId, telegramId) {
	Question.getAll()
		.then(questions => {
			User.getUser({ telegramId })
				.then((user) => {
					let questionsFiltered = questions.filter(q => q.survey === surveyId);
					user.answers = [];
					user.survey = surveyId;
					questionsFiltered.map(q => {
						user.answers.push({"answer": "","questionId": q.id,"question": q.question});
					});
					return User.update({telegramId: user.telegramId}, user);
				})
		})
});

exports.getQuestions = async(function* () {
    return Question.getAll();
});

exports.getSurveys = async(function* () {
	return Survey.getAll();
});

exports.getUsers = async(function* () {
    return User.getAll();
});

exports.removeSurvey = async(function* (name) {
	this.getSurveys()
		.then(surveys => {
			const deletingSurveyId = surveys.find(survey => survey.name = name).id;
			return Survey.remove(deletingSurveyId)
		});
});

// exports.findAndDeleteTheQuestion = async(function* (question) {
//     return Question.getQuestionByName(question)
//         .then(thequestion => {
//             if (thequestion) {
//                 thequestion.isDeleted = true;
//                 return thequestion.save();
//             } else {
//                 throw 'No such question!';
//             }
//         });
// });

exports.getUser = async(function* (telegramId) {
    return User.getUser({telegramId: telegramId});
});

exports.createUser = async(function* (data) {
    Question.getAll()
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

    User.getUser({telegramId: telegramId})
        .then(user => {
            user.answers.find(a => a.question === question).answer = answer;
            user.answers.find(a => a.question === question).answerId = answerId;
            return User.update({telegramId: user.telegramId}, user);
        });
});