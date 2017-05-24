import Service from '../service';
import SurveyModel from '../../models/survey';
import QuestionModel from '../../models/question';
import UserModel from '../../models/user';
const uuidV4 = require('uuid/v4');
const { postSpreadSheets } = require('../google-spreadsheets');

const TelegramBot = require('node-telegram-bot-api');

// replace the value below with the Telegram token you receive from @BotFather
//test: 330486268:AAEEi7yURFX0EZQRE7EhylamB1-WaJi5ljg
// origin: 350720484:AAEgITsnyA0ZIFgQ46ivEq7Sp2VTrt4YDUg
// dev: 329116244:AAHDzSnwr49C2PIe4OES2HJgrZTB0QLqc_w
// v2 dev: 360889127:AAEPjHX8IDZ3jaG4x-ATVwFxSymVfQ2ENmk
const token = '329116244:AAHDzSnwr49C2PIe4OES2HJgrZTB0QLqc_w';

/**
 * Service level class with methods for surveys.
 */
export default class SurveyService extends Service {
    constructor() {
        super();
        this.model = new SurveyModel();
        this.modelQuestion = new QuestionModel();
        this.modelUser = new UserModel();
	    this.bot = new TelegramBot(token, {polling: true});
	    console.log(this.bot.sendMessage);
    }
    
    /**
     * Method for request all surveys.
     *
     * @param {String} req request from client
     * @param {String} res response to client
     * @return {Promise} promise
     */
    getAll(req, res) {
        
        return (
            this.model.getAll()
                .then(data => {
                    res.json({data});
                })
                .catch(error => {
                    res.status(400).send(JSON.stringify({err: error.message || error}));
                }))
    };
    
     /**
     * Method for handle google loading.
     *
     * @param {String} req request from client
     * @param {String} res response to client
     * @return {Promise} promise
     */
     handleGoogle(req, res) {
        
        return (
            Promise.all([
                this.model.getAll(),
                this.modelQuestion.getAll(),
                this.modelUser.getAll()
                ])
                 .then(response => {
                     const surveys = response[0];
                     const questions = response[1];
                     const users = response[2];
                     try {
                         postSpreadSheets(questions, users, surveys, () => {
                         	res.status(200).send(JSON.stringify({msg: "Migration complete"}))
                         });
                     } catch (e) {
                         console.log(e);
                     }
                 })
                .catch(error => {
                    res.status(400).send(JSON.stringify({err: error.message || error}));
                }))
    };
    
    /**
     * Method for handle unsended questions.
     *
     * @param {String} req request from client
     * @param {String} res response to client
     * @return {Promise} promise
     */
    handleNoAnswers(req, res) {
        return (
            Promise.all([
                this.model.getAll(),
                this.modelQuestion.getAll(),
                this.modelUser.getAll()
            ])
                .then(response => {
                    const surveys = response[0];
                    const questions = response[1];
                    const users = response[2];
    
                    let unfinishedUsers = [];
                    for (let user of users) {
                        let unfinish = false;
                        for (let answer of user.answers) {
                            if (!answer.answer) {
                                unfinish = true
                            }
                        }
                        if (unfinish) {
                            unfinishedUsers.push(user);
                        }
                    }
                    if (unfinishedUsers.length) {
                        
                        let j;
                        const sendInterval = setInterval(function () {
                            if (j === undefined) j = 0;

                            let user = unfinishedUsers[j];
	                        user.answers.sort((a, b) => {
		                        return questions.find(q => q.id === a.questionId).index - questions.find(q => q.id === b.questionId).index
	                        });
                            const thankYou = surveys.find((survey) => survey.id === user.survey).thankYou;
                            let filter_answers = user.answers.filter(answer => !answer.answer);
                            let i = 0;
                            for (i; i < filter_answers.length; i++) {
                                let questionitself = questions.find(question => question.id === filter_answers[i].questionId);
                                if (questionitself.isDeleted !== true) break
                            }
                            let qid = filter_answers[i].questionId;
                            const reply_markup = {
                                inline_keyboard: []
                            };
                            let nextQuestion = (questions.find(question => question.id === qid));
                            if (nextQuestion.answers.length) {
                                nextQuestion.answers.forEach(answer => {
                                    reply_markup.inline_keyboard.push([{
                                        text: answer.text,
                                        callback_data: `false|${thankYou}|${nextQuestion.id}|${answer.id}`,
                                        resize_keyboard: true
                                    }]);
                                });
                                if (nextQuestion.ownAnswer.text) {
                                    reply_markup.inline_keyboard.push([{
                                        text: nextQuestion.ownAnswer.text,
                                        callback_data: `false|${thankYou}|${nextQuestion.id}|${nextQuestion.ownAnswer.id}|true`,
                                        resize_keyboard: true
                                    }]);
                                }
                                const opts = {
                                    "parse_mode": "Markdown",
                                    "reply_markup": JSON.stringify(reply_markup)
                                };

                                this.bot.sendMessage(user.chatId, nextQuestion.question, opts);
                            } else {
                                const opts = {
                                    reply_markup: {
                                        force_reply: true,
                                    }
                                };
                                this.bot.sendMessage(user.chatId, nextQuestion.question, opts);
                            }
                            j++;
                            if (j === unfinishedUsers.length) clearInterval(sendInterval);
                        }, 50);
                        
                        res.status(200).send(JSON.stringify({msg: "Sent successfully"}));
                    } else {
                        res.status(200).send(JSON.stringify({msg: "No users with unanswered questions"}));
                    }
                })
                .catch(error => {
                    res.status(400).send(JSON.stringify({err: error.message || error}));
                }))
    };
    
    /**
     * Method for create survey .
     *
     * @param {String} req request from client
     * @param {String} res response to client
     * @return {Promise} promise
     */
    create(req, res) {
    
        const id = uuidV4();
        req.body.id = id;
        return (
            this.model.create(req.body)
                .then(() => {
                    res.status(200).send(JSON.stringify({id}));
                })
                .catch(error => {
                    res.status(400).send(JSON.stringify({err: error.message || error}));
                }))
    };
    
    /**
     * Method for update survey .
     *
     * @param {String} req request from client
     * @param {String} res response to client
     * @return {Promise} promise
     */
    update(req, res) {
        
        return (
            this.model.update(req.body)
                .then(() => {
                    res.status(200).send(JSON.stringify({msg: "Survey updated"}));
                })
                .catch(error => {
                    res.status(400).send(JSON.stringify({err: error.message || error}));
                }))
    };
    
    /**
     * Method for delete survey .
     *
     * @param {String} req request from client
     * @param {String} res response to client
     * @return {Promise} promise
     */
    remove(req, res) {
        
        return (
            this.model.remove(req.body.id)
	            .then(() => {
	                res.status(200).send(JSON.stringify({msg: "Survey deleted"}));
	            })
	            .catch(error => {
	                res.status(400).send(JSON.stringify({err: error.message || error}));
	            }))
    };
    
    /**
     * Method for activate survey .
     *
     * @param {String} req request from client
     * @param {String} res response to client
     * @return {Promise} promise
     */
    activate(req, res) {
        
        return (
            this.model.activate(req.body)
                .then(() => {
                    res.status(200).send(JSON.stringify({msg: "Survey status changed"}));
                })
                .catch(error => {
                    res.status(400).send(JSON.stringify({err: error.message || error}));
                }))
    };
}