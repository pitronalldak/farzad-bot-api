const uuid = require('uuid/v4');
const moment = require('moment');
const cache = require('memory-cache');

const Bot = require('messenger-bot');

//Raya app_secret ee4ae72413dcef839fadf7def128730f
//Raya token EAAB88KgOVIMBACcAIMquCpZA5s4ebZAnJygIYZAZBL5XYlc4MuEJpS0am7mmuyR2A2FftFDtwIcudTNSedqjnYBvXRR6sZA7QpmStNmfOb2ugcsG7zbcLzo3luheGBbFUCK5ZAQg0m5EQAKzwuL4hBE4JREUAFms98UWmHTykEFQZDZD
//coinSurveyTest app_secret 6d9d2c7cd89ca219fbb91fac2423e26c
//coinSurveyTest token EAADo1ImIiwgBAJe4p4HBIVOPomH5yOFd7kIGIXTQyvObOpSHzMM6oWzvCwuwpuwcHLkidZB7IsCGGhtAbNizZC9iZCcFZCIvhfiXu3ZBAJxl50IYVRTGJATgipYbZACI9aQ8tRU60zgX7YJF3rmyfnUXfw7Y7GvBiulj4TvWZC8TgZDZD

let inform = {
    token: 'EAADo1ImIiwgBAJe4p4HBIVOPomH5yOFd7kIGIXTQyvObOpSHzMM6oWzvCwuwpuwcHLkidZB7IsCGGhtAbNizZC9iZCcFZCIvhfiXu3ZBAJxl50IYVRTGJATgipYbZACI9aQ8tRU60zgX7YJF3rmyfnUXfw7Y7GvBiulj4TvWZC8TgZDZD',
    verify: 'veryveryverify_token_for_my_test_bot',
    app_secret: '6d9d2c7cd89ca219fbb91fac2423e26c'
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

export let botFacebook = new Bot(inform);

botFacebook.setGetStartedButton(getStartedPayload, (err, profile) => {
    if(err) console.log(err)
})

botFacebook.on('error', (err) => {
  console.log(err.message);
})

botFacebook.on('message', (payload, reply) => {
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
                  id : id,
                  question: questionId,
                  user: facebookId,
                  text: text
                })
                modelSurvey.getAll()
                  .then((surveys) => {
                    const thankYou = surveys.find((survey) => survey.id === user.survey).thankYou;
                    
                    modelAnswer.getByUser(facebookId)
                      .then(answers => {
                        let nextQuestion = questions.find(q => (!answers.some(a => a.question == q.id) && user.survey === q.survey));
                        if (nextQuestion) {
                          const elements = [];
                          const buttons = [];
                          let counter = 0;
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
                                title: nextQuestion.ownAnswer.text,
                                payload: `false|${thankYou}|${nextQuestion.id}|${nextQuestion.ownAnswer.id}|true`
                              })
                            }
                            for(let i = 0; i < counter; ) {
                              let title;
                              if(i == 0){
                                title = nextQuestion.question
                              } else {
                                title = '_';
                              }
                              const pack = { title : title, 
                                buttons : []}
                                pack.buttons.push(buttons[i]);
                                i++;
                              for(;!!(i % 3) && i < counter; i++){
                                pack.buttons.push(buttons[i]);
                              }
                              elements.push(pack);
                            }


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

                          if(elements.length){
                            reply(messageData , (err, info) => {
                              if(err) console.log(err)
                            });

                          } else {
                            reply({ 'text' : nextQuestion.question }, (err, info) => {
                                  if(err) console.log(err)
                                  reply({ 'text' : 'Print answer please' }, (err, info) => {
                                    if(err) console.log(err)
                                  });
                                });
                            cache.put(facebookId, nextQuestion.id);
                          }
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
      cache.put(facebookId, false)
      botFacebook.getProfile(payload.sender.id, (err, profile) => {
        cache.put(payload.sender.id, false)
        if (err) throw err
        modelQuestion.getAll()
        .then(questions => {
            const userData = {
              date: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
              username: `${profile.first_name} ${profile.last_name}`,
              telegramId: facebookId,
              chatId: '',
              answers: []
            };
            modelUser.getUser({telegramId: facebookId})
              .then(user => {
                if (user) {
                  const update = {answers : [], date : moment().format('YYYY-MM-DDTHH:mm:ssZ'), survey : '', chatId : ''}
                  modelUser.update({telegramId : facebookId}, update);

                  //remove all users answers
                  modelAnswer.getByUser(facebookId)
                    .then(answers => {
                      answers.forEach(answer => {
                        modelAnswer.remove({id : answer.id})
                      })
                  })

                  return user.save();
                } else {
                  return modelUser.create(userData);
                }
              });
        })
        .then(() =>
        modelSurvey.getAll()
          .then((surveys) => {
            const elements = [];
            const buttons = [];
            let counter = 0;
            if (surveys.length && surveys.some(s => s.isActiveFacebook)) {
              surveys.forEach(survey => {
                if (survey.isActiveFacebook) {
                  counter++;
                  buttons.push({
                    type : 'postback',
                    title: survey.name,
                    payload: `true|${survey.id}|${survey.thankYou}`
                  });
                }

              });

              for(let i = 0; i < counter; ) {
                let title;
                if(i == 0){
                  title = "Choose language please";
                } else {
                  title = '_';
                }
                const pack = { title : title, 
                  buttons : []}
                  pack.buttons.push(buttons[i]);
                  i++;
                for(;!!(i % 3) && i < counter; i++){
                  pack.buttons.push(buttons[i]);
                }
                elements.push(pack);
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
        )
      })
    }
  }
});


botFacebook.on('postback', (payload, reply, actions) => {
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
            modelUser.update({telegramId : facebookId}, survey);
            user.survey = surveyId;
            user.save();
            modelQuestion.getAll()
              .then(questions => {
                //remove user answers for an survey
                /*modelAnswer.getByUser(facebookId)
                .then(answers => {
                  let questionsFiltered = questions.filter(q => q.survey === surveyId);

                  answers.forEach(answer => {
                    if(questionsFiltered.find(q => answer.question === q.id)){
                      modelAnswer.remove({id : answer.id});
                    }
                  });
                })*/
              })
              .then(() => {
                questionsFiltered = questions.filter(q => q.survey === surveyId);
                const elements = [];
                const buttons = [];
                let counter = 0;

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
                    counter = responseQuestion.answers.length;
                    responseQuestion.answers.forEach(answer => {
                      buttons.push({
                          type : 'postback',
                          title: answer.text,
                          payload: `false|${thankYou}|${responseQuestion.id}|${answer.id}`
                      })
                    });

                    if (responseQuestion.ownAnswer.text) {
                      counter++;
                      buttons.push({
                        type : 'postback',
                        title: responseQuestion.ownAnswer.text,
                        payload: `false|${thankYou}|${responseQuestion.id}|${responseQuestion.ownAnswer.id}|true`
                      });
                    }

                    for(let i = 0; i < counter; ) {
                      let title;
                      if(i == 0){
                        title = responseQuestion.question
                      } else {
                        title = '_';
                      }
                      const pack = { title : title, 
                        buttons : []}
                        pack.buttons.push(buttons[i]);
                        i++;
                      for(;!!(i % 3) && i < counter; i++){
                        pack.buttons.push(buttons[i]);
                      }
                      elements.push(pack);
                    }

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
                  if(elements.length){
                    reply(messageData , (err, info) => {
                        if(err) console.log(err)
                      });
                  } else {
                    reply({ 'text' : responseQuestion.question }, (err, info) => {
                      if(err) console.log(err)
                      reply({ 'text' : 'Print answer please' }, (err, info) => {
                        if(err) console.log(err)
                      });
                    });
                    cache.put(facebookId, responseQuestion.id);
                  }
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
                id : id,
                question: questionId,
                user: facebookId,
                text: answer
              })
              .then(() => {
                const elements = [];
                const buttons = [];
                let counter = 0;
                modelAnswer.getByUser(facebookId)
                  .then(answers => {
                    let nextQuestion = questions.find(q => (!answers.some(a => a.question === q.id) && user.survey === q.survey));

                    if (nextQuestion) {
                      if (nextQuestion.answers.length) {
                        counter = nextQuestion.answers.length;
                        nextQuestion.answers.forEach(answer => {
                          buttons.push({
                            type : 'postback',
                            title: answer.text,
                            payload: `false|${thankYou}|${nextQuestion.id}|${answer.id}`
                          });
                        });

                        if (nextQuestion.ownAnswer.text) {
                          counter++;
                          buttons.push({
                            type : 'postback',
                            title: nextQuestion.ownAnswer.text,
                            payload: `false|${thankYou}|${nextQuestion.id}|${nextQuestion.ownAnswer.id}|true`
                          });
                        }
                        for(let i = 0; i < counter; ) {
                          let title;
                              if(i == 0){
                                title = nextQuestion.question
                              } else {
                                title = '_';
                              }
                          const pack = { title : title, 
                            buttons : []}
                            pack.buttons.push(buttons[i]);
                            i++;
                          for(;!!(i % 3) && i < counter; i++){
                            pack.buttons.push(buttons[i]);
                          }
                          elements.push(pack);
                        }


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
                      if(elements.length){
                        reply(messageData , (err, info) => {
                          if(err) console.log(err)
                        });
                      } else {
                        reply({ 'text' : nextQuestion.question }, (err, info) => {
                          if(err) console.log(err)
                          reply({ 'text' : 'Print answer please' }, (err, info) => {
                            if(err) console.log(err)
                          });
                        });
                        
                        cache.put(facebookId, nextQuestion.id);
                      }
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
  

