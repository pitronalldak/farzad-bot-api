import Service from '../service';
import SurveyModel from '../../models/survey';
import QuestionModel from '../../models/question';
import UserModel from '../../models/user';
const uuidV4 = require('uuid/v4');
const { postSpreadSheets } = require('../google-spreadsheets');

const TelegramBot = require('node-telegram-bot-api');

// replace the value below with the Telegram token you receive from @BotFather
const token = '330486268:AAEEi7yURFX0EZQRE7EhylamB1-WaJi5ljg'; //test: 330486268:AAEEi7yURFX0EZQRE7EhylamB1-WaJi5ljg origin: 350720484:AAEgITsnyA0ZIFgQ46ivEq7Sp2VTrt4YDUg


/**
 * Service level class with methods for surveys.
 */
export default class SurveyService extends Service {
    constructor(dao) {
        super();
        this.model = new SurveyModel();
        this.modelQuestion = new QuestionModel();
        this.modelUser = new UserModel();
        this.bot = new TelegramBot(token, {polling: true});
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
                         postSpreadSheets(questions, users, surveys);
                         res.status(200).send(JSON.stringify({msg: "Migration complete"}));
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
                        for (let answer of user.answers) {
                            if (!answer.answer) {
                                unfinishedUsers.push(user);
                            }
                        }
                    }

                    for (let user of unfinishedUsers) {
                        let qid = user.answers.filter(answer => !answer.answer)[0].questionId;

                        const reply_markup = {
                            inline_keyboard: []
                        };
        
                        let nextQuestion = (questions.find(question => question.id == qid));
                        console.log(nextQuestion);
                        if ((nextQuestion === undefined) || (nextQuestion === null)) {
                            nextQuestion = questions[0];
                        }
                        if (nextQuestion.answers.length) {
                            nextQuestion.answers.forEach(answer => {
                                reply_markup.inline_keyboard.push([{
                                    text: answer.text,
                                    callback_data: `${nextQuestion.id}|${answer.id}`,
                                    resize_keyboard: true
                                }]);
                            });
                            if (nextQuestion.ownAnswer.text) {
                                reply_markup.inline_keyboard.push([{
                                    text: nextQuestion.ownAnswer.text,
                                    callback_data: `${nextQuestion.id}|${nextQuestion.ownAnswer.id}|true`,
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
                    }
                    res.status(200).send(JSON.stringify({msg: "All questions sent"}));
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