import Service from '../service';
import SurveyModel from '../../models/survey';
import QuestionModel from '../../models/question';
import UserModel from '../../models/user';
import AnswerModel from '../../models/answer';
import {bot} from '../../telegram';
import {botFacebook} from '../../facebook';

const uuidV4 = require('uuid/v4');
const {postSpreadSheets} = require('../google-spreadsheets');

/**
 * Service level class with methods for surveys.
 */
export default class SurveyService extends Service {
  constructor() {
    super();
    this.model = new SurveyModel();
    this.modelQuestion = new QuestionModel();
    this.modelUser = new UserModel();
    this.modelAnswer = new AnswerModel();
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
        this.modelUser.getAll(),
        this.modelAnswer.getAll()
      ])
        .then(response => {
          const surveys = response[0];
          const questions = response[1];
          const users = response[2];
          const answers = response[3];
          try {
            postSpreadSheets(questions, users, surveys, answers, () => {
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
      this.modelUser.getAllWithSurvey()
      .then(users => {
        let isUnAnswers = false;
        users.forEach(user => {
          Promise.all([
            this.modelQuestion.getAll({survey: user.survey}),
            this.modelAnswer.getByUser(user.telegramId)
          ])
            .then(response => {
              const questions = response[0];
              const answers = response[1];
  
              let nextQuestion = questions.find(q => !answers.some(a => a.question == q.id));
              if (nextQuestion) {
                isUnAnswers = true;
                
                console.log("chatId : " + user.chatId)
                if(user.chatId){
                  if (nextQuestion.answers.length) {
                    
                    const opts = {
                      reply_markup: {
                        inline_keyboard: []
                      }
                    };
                    const thankYou = 'Thank You';
  
                    nextQuestion.answers.forEach(answer => {
                      opts.reply_markup.inline_keyboard.push([{
                        text: answer.text,
                        callback_data: `false|${thankYou}|${nextQuestion.id}|${answer.id}`,
                        resize_keyboard: true
                      }])
                    });
                    if (nextQuestion.ownAnswer.text) {
                      opts.reply_markup.inline_keyboard.push([{
                        text: nextQuestion.ownAnswer.text,
                        callback_data: `false|${thankYou}|${nextQuestion.id}|${nextQuestion.ownAnswer.id}|true`
                      }]);
                    }
                    bot.sendMessage(user.chatId, nextQuestion.question, opts);
                  }
                  else {
                    console.log(nextQuestion.question)
                    const opts = {
                      reply_markup: {
                        force_reply: true,
            
                      }
                    };
                    bot.sendMessage(user.chatId, nextQuestion.question, opts)
                  }
                } else {
                  const elements = [];
                  const buttons = [];
                  let counter = 0;
                  const thankYou = 'Thank You';
                  if (nextQuestion.answers.length) {
                    counter = nextQuestion.answers.length;
                    nextQuestion.answers.forEach(answer => {
                      buttons.push({
                        type : 'postback',
                        title: answer.text,
                        payload: `false|${thankYou}|${nextQuestion.id}|${answer.id}`
                      })
                    });
                    if (nextQuestion.ownAnswer.text) {
                      counter++;
                      buttons.push({
                        type : 'postback',
                        title : nextQuestion.ownAnswer.text,
                        payload : `false|${thankYou}|${nextQuestion.id}|${nextQuestion.ownAnswer.id}|true`
                      });
                    }

                    for(let i = 0; i < counter; ) {
                      const pack = { title : nextQuestion.question, 
                        buttons : []}
                        pack.buttons.push(buttons[i]);
                        i++;
                      for(;!!(i % 3) && i < counter; i++){
                        pack.buttons.push(buttons[i]);
                      }
                      elements.push(pack);
                    }

                  }
                  else {
                    elements.push({
                        title : nextQuestion.question,
                        buttons : [{
                        type : 'postback',
                        title : nextQuestion.ownAnswer.text,
                        payload : `false|${thankYou}|${nextQuestion.id}|${nextQuestion.ownAnswer.id}|true`
                      }]});
                  }

                  const messageData = {
                        "attachment": {
                          "type": "template",
                          "payload": {
                            "template_type":"generic",
                            "elements": JSON.stringify(elements)    
                        }
                      }
                  }
                  //console.log("jbbkjbljb")
                  botFacebook.sendMessage(+user.telegramId, messageData, (err, info) => {
                      if(err) console.log(err)
                    })
                }
              }
            })
        })
        res.status(200).send(JSON.stringify({msg: "Sent successfully"}));
      })
      .catch(error => {
        res.status(400).send(JSON.stringify({err: error.message || error}));
      })
  )
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
   * Method for activate telegram survey.
   *
   * @param {String} req request from client
   * @param {String} res response to client
   * @return {Promise} promise
   */
  activateTelegram(req, res) {
    
    return (
      this.model.activateTelegram(req.body)
        .then(() => {
          res.status(200).send(JSON.stringify({msg: "Survey status changed"}));
        })
        .catch(error => {
          res.status(400).send(JSON.stringify({err: error.message || error}));
        }))
  };
  
  /**
   * Method for activate facebook survey.
   *
   * @param {String} req request from client
   * @param {String} res response to client
   * @return {Promise} promise
   */
  activateFacebook(req, res) {
    
    return (
      this.model.activateFacebook(req.body)
        .then(() => {
          res.status(200).send(JSON.stringify({msg: "Survey status changed"}));
        })
        .catch(error => {
          res.status(400).send(JSON.stringify({err: error.message || error}));
        }))
  };
}