const uuid = require('uuid/v4');
const moment = require('moment');
const cache = require('memory-cache');

const Bot = require('messenger-bot');


let inform = {
	  token: 'EAAB88KgOVIMBACcAIMquCpZA5s4ebZAnJygIYZAZBL5XYlc4MuEJpS0am7mmuyR2A2FftFDtwIcudTNSedqjnYBvXRR6sZA7QpmStNmfOb2ugcsG7zbcLzo3luheGBbFUCK5ZAQg0m5EQAKzwuL4hBE4JREUAFms98UWmHTykEFQZDZD',
	  verify: 'veryveryverify_token_for_my_test_bot',
	  app_secret: 'ee4ae72413dcef839fadf7def128730f'
	};

let getStartedPayload = [{
      "payload":"Start_payload"
	}];

import QuestionModel from '../models/question';
import UserModel from '../models/user';
import SurveyModel from '../models/survey';
import AnswerModel from '../models/answer';

const modelQuestion = new QuestionModel();
const modelUser = new UserModel();
const modelSurvey = new SurveyModel();
const modelAnswer = new AnswerModel();

export let bot = new Bot(inform);

bot.setGetStartedButton(getStartedPayload, (err, profile) => {
    if(err) console.log(err)
})

bot.on('error', (err) => {
  console.log(err.message);
})

bot.on('message', (payload, reply) => {
  const text = payload.message.text
  const facebookId = payload.sender.id
  const questionId = cache.get(facebookId)
  if (questionId){
      cache.put(facebookId, false)

      modelQuestion.getAll()
      .then((questions) => {
        modelUser.getUser({telegramId: facebookId})
              .then((user) => {
                const id = uuid.v4();
                modelAnswer.create({
                  id,
                  question: questionId,
                  user: facebookId,
                  text: text
                })
                modelSurvey.getAll()
                  .then((surveys) => {
                    const thankYou = surveys.find((survey) => survey.id === user.survey).thankYou;
                    
                    modelAnswer.getByUser(facebookId)
                      .then(answers => {
                        let nextQuestion = questions.find(q => !answers.some(a => a.question == q.id));
                        if (nextQuestion) {
                          const elements = [];
                          if (nextQuestion.answers.length) {
                            nextQuestion.answers.forEach(answer => {
                              elements.push({
                                  title : nextQuestion.question,
                                  buttons : [{
                                  type : 'postback',
                                  title: answer.text,
                                  payload: `false|${thankYou}|${nextQuestion.id}|${answer.id}`
                                  }]
                                })
                            });
                            if (nextQuestion.ownAnswer.text) {
                              elements.push({ 
                                title : nextQuestion.question,
                                buttons : [{
                                type : 'postback',
                                title: nextQuestion.ownAnswer.text,
                                payload: `false|${thankYou}|${nextQuestion.id}|${nextQuestion.ownAnswer.id}|true`
                              }]});
                            }

                          }
                          else {
                            console.log(nextQuestion.question)
                            elements.push({ 
                              title : nextQuestion.question,
                              buttons : [{
                              type : 'postback',
                              title: nextQuestion.ownAnswer.text,
                              payload: `false|${thankYou}|${nextQuestion.id}|${nextQuestion.ownAnswer.id}|true`
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

                          reply(messageData , (err, info) => {
                            if(err) console.log(err)
                          });
                        } else {
                          reply( { 'text' : thankYou }, (err, info) => {
                            if(err) console.log(err)
                          });
                        }
                      })
                  })
              })
      })

  } else {
    if (text === 'start'){
      bot.getProfile(payload.sender.id, (err, profile) => {
        cache.put(payload.sender.id, false)
        if (err) throw err
        modelQuestion.getAll()
          .then(questions => {
            const userData = {
              date: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
              username: `${profile.first_name} ${profile.last_name}`,
              telegramId: payload.sender.id,
              chatId: payload.sender.id,
              answers: []
            };
            modelUser.getUser({telegramId: payload.sender.id})
              .then(user => {
                if (user) {
                  user.answers = [];
                  user.date = moment().format('YYYY-MM-DDTHH:mm:ssZ');
                  questions.forEach(q => user.answers.push({question: q.question, questionId: q.id}));
                  user.chatId = userData.chatId;
                  return user.save();
                } else {
                  questions.forEach(q => userData.answers.push({question: q.question, questionId: q.id}));
                  return modelUser.create(userData);
                }
              });
        })
        .then(() =>
        modelSurvey.getAll()
          .then((surveys) => {
            const elements = [];
            if (surveys.length && surveys.some(s => s.isActive)) {
              surveys.forEach(survey => {
                if (survey.isActive) {
                  elements.push({
                    title : "Choose language please",
                    buttons : [{
                    type : 'postback',
                    title: survey.name,
                    payload: `true|${survey.id}|${survey.thankYou}`
                  }]});
                }
              });
              const messageData = {
                                "attachment": {
                                  "type": "template",
                                  "payload": {
                                    "template_type":"generic",
                                    "elements": JSON.stringify(elements)    
                                }
                              }
                          }
              reply(messageData , (err, info) => {
                if(err) console.log(err)
              });
            } else {
              reply( { 'text' : 'Sorry, we don\'t have any surveys yet' }, (err, info) => {
                if(err) console.log(err)
              });
            }
          })
        )
      })
    }
  }
});


bot.on('postback', (payload, reply, actions) => {
  let payload_text = payload.postback.payload
  if (payload_text == "Start_payload"){
    reply({'text' : 'Print start please'} , (err, info) => {
      if(err) console.log(err)})
  } else {
    const facebookId = payload.sender.id;
    const payload_data = payload_text.split('|');
    const isFirst = payload_data[0];
    let surveyId;
    let questionId;
    let answerId;
    let isOwnAnswer;
    let thankYou;

    if (isFirst === 'true') {
      surveyId = payload_data[1];
      thankYou = payload_data[2];
    } else {
      thankYou = payload_data[1];
      questionId = payload_data[2];
      answerId = payload_data[3];
      isOwnAnswer = !!payload_data[4];
    }

    modelQuestion.getAll()
    .then(questions => {
      modelUser.getUser(facebookId)
        .then((user) => {
          let questionsFiltered;
          if (isFirst  === 'true') {
            const survey = { survey : surveyId };
            modelUser.update({telegramId: facebookId}, survey);
            modelQuestion.getAll()
              .then(questions => {
                let questionsFiltered = questions.filter(q => q.survey === surveyId);
                const answer = {text: ''};
                questionsFiltered.forEach(q => {
                  modelAnswer.update({user: user.telegramId , question: q.id}, answer);
                });
              })
              .then(() => {
                questionsFiltered = questions.filter(q => q.survey === surveyId);
                const elements = [];
                let responseQuestion;
                let questionExist = false;

                for (let question of questions) {
                  if (question.isDeleted !== true && question.survey === surveyId)  {
                    responseQuestion = question;
                    questionExist = true;
                    break
                  }
                }
                if (questionExist) {

                  if (responseQuestion.answers.length) {
                    responseQuestion.answers.forEach(answer => {
                      elements.push({ 
                        title : responseQuestion.question,
                        buttons : [{
                          type : 'postback',
                          title: answer.text,
                          payload: `false|${thankYou}|${responseQuestion.id}|${answer.id}`
                      }]})
                    });

                    if (responseQuestion.ownAnswer.text) {
                      elements.push({
                        title : responseQuestion.question,
                        buttons : [{
                        type : 'postback',
                        title: responseQuestion.ownAnswer.text,
                        payload: `false|${thankYou}|${responseQuestion.id}|${responseQuestion.ownAnswer.id}|true`
                      }]});
                    }
                  } else {
                    elements.push({
                        title : responseQuestion.question,
                        buttons : [{
                        type : 'postback',
                        title: responseQuestion.ownAnswer.text,
                        payload: `false|${thankYou}|${responseQuestion.id}|${responseQuestion.ownAnswer.id}|true`
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
                  reply(messageData , (err, info) => {
                      if(err) console.log(err)
                    });
                } else {
                  reply( { 'text' : 'Sorry, we don\'t have any surveys yet' }, (err, info) => {
                    if(err) console.log(err)
                  });
                }
              })
          } else {
            const question = questions.find(q => q.id == questionId).question;
            if (isOwnAnswer) {
              reply( { 'text' : 'Print answer please' }, (err, info) => {
                    if(err) console.log(err)
                  });
              cache.put(facebookId, questionId);
            } else {
              const answer = questions.find(q => q.id == questionId).answers
                .find(a => a.id == answerId).text;
              const id = uuid.v4();
              modelAnswer.create({
                id,
                question: questionId,
                user: facebookId,
                text: answer
              })
              .then(() => {
                const elements = [];

                modelAnswer.getByUser(facebookId)
                  .then(answers => {
                    let nextQuestion = questions.find(q => !answers.some(a => a.question == q.id));
                    if (nextQuestion) {
                      if (nextQuestion.answers.length) {
                        nextQuestion.answers.forEach(answer => {
                          elements.push({
                            title : nextQuestion.question,
                            buttons : [{
                            type : 'postback',
                            title: answer.text,
                            payload: `false|${thankYou}|${nextQuestion.id}|${answer.id}`
                          }]});
                        });

                        if (nextQuestion.ownAnswer.text) {
                          elements.push({
                            title : nextQuestion.question,
                            buttons : [{
                            type : 'postback',
                            title: nextQuestion.ownAnswer.text,
                            payload: `false|${thankYou}|${nextQuestion.id}|${nextQuestion.ownAnswer.id}|true`
                          }]});
                        }

                      } else {
                        elements.push({
                            title : nextQuestion.question,
                            buttons : [{
                            type : 'postback',
                            title: nextQuestion.ownAnswer.text,
                            payload: `false|${thankYou}|${nextQuestion.id}|${nextQuestion.ownAnswer.id}|true`
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

                        reply(messageData , (err, info) => {
                          if(err) console.log(err)
                        });
                    } else {
                       reply( { 'text' : thankYou }, (err, info) => {
                        if(err) console.log(err)
                      });
                    }
                  })
              })
            }
          }
        })
      })
    }
})
  

