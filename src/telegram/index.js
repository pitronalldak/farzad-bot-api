const uuid = require('uuid/v4');
const moment = require('moment');

const TelegramBot = require('node-telegram-bot-api');
const action = require('../messages/bot_app/actions');
const { postSpreadSheets } = require('../services/google-spreadsheets');

// replace the value below with the Telegram token you receive from @BotFather
//test: 330486268:AAEEi7yURFX0EZQRE7EhylamB1-WaJi5ljg
// origin: 350720484:AAEgITsnyA0ZIFgQ46ivEq7Sp2VTrt4YDUg
// dev: 329116244:AAHDzSnwr49C2PIe4OES2HJgrZTB0QLqc_w
// v2 dev: 360889127:AAEPjHX8IDZ3jaG4x-ATVwFxSymVfQ2ENmk
const token = '330486268:AAEEi7yURFX0EZQRE7EhylamB1-WaJi5ljg';

import QuestionModel from '../models/question';
import UserModel from '../models/user';
import SurveyModel from '../models/survey';
import AnswerModel from '../models/answer';

const modelQuestion = new QuestionModel();
const modelUser = new UserModel();
const modelSurvey = new SurveyModel();
const modelAnswer = new AnswerModel();

// Create a bot that uses 'polling' to fetch new updates
export const bot = new TelegramBot(token, {polling: true});

//Show info on screen
bot.onText(/info (.+)/, function (msg, match) {
  const password = match[1];
  const chatId = msg.chat.id;
  if (password === PASSWORD) {
    const text = '- start - Start your interview. \n \n' +
      '- add_survey: password|name|thankyou - Create new survey.\n \n' +
      '- add_question: password|survey|question{answer/answer/answer} - Create new question with options in the survey.\n \n' +
      '- add_question: password|survey|question - Create new question without input answer in the survey.\n \n' +
      '- add_question: password|survey|question{answer/answer/answer}|own custom variant - Create new question with options and input answer in the survey.\n \n' +
      '- remove_survey: password|name - Remove all questions in the survey and the survey itself.\n \n' +
      // '- remove_question_by_name: password|question - Remove the question with typed name from the interview.\n \n' +
      '- info password - Get commands list.\n \n' +
      '- google password - Download database to google spreadsheet.\n \n' +
      '- send password - Send all unanswered questions and added afterwards to all users have ever participated.';
    bot.sendMessage(chatId, text);
  } else {
    bot.sendMessage(chatId, `Wrong password!`)
  }
});

//Bot reaction to msg, put answer to the db, send next question or thank you
bot.on('message', msg => {
  if (msg.reply_to_message) {
    const telegramId = msg.reply_to_message.chat.id;
    const question = msg.reply_to_message.text;
    const answer = msg.text;
    const id = uuid.v4();
  
    modelQuestion.getAll()
      .then((questions) => {
        const questionId = questions.find(a => a.question === question).id;
        modelAnswer.create({
          id : id,
          question: questionId,
          user: telegramId,
          text: answer
        })
        modelUser.getUser({telegramId: telegramId})
              .then((user) => {
                modelSurvey.getAll()
                  .then((surveys) => {
                    const chatId = msg.chat.id;
                    const thankYou = surveys.find((survey) => survey.id === user.survey).thankYou;
                    const opts = {
                      reply_markup: {
                        inline_keyboard: []
                      }
                    };
                    modelAnswer.getByUser(telegramId)
                      .then(answers => {
                        let nextQuestion = questions.find(q => !answers.some(a => a.question == q.id) && user.survey === q.survey);
                        if (nextQuestion) {
                          if (nextQuestion.answers.length) {
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
                            bot.sendMessage(chatId, nextQuestion.question, opts);
                          }
                          else {
                            console.log(nextQuestion.question)
                            const opts = {
                              reply_markup: {
                                force_reply: true,
                                
                              }
                            };
                            bot.sendMessage(chatId, nextQuestion.question, opts)
                          }
                        } else {
                          bot.sendMessage(chatId, thankYou);
                        }
                      })
                  })
              })
      })
  }
});

//Bot reaction to button tap, put answer to the db, send first or next question or thank you
bot.on('callback_query', callbackQuery => {
  const telegramId = callbackQuery.from.id;
  const message = callbackQuery.message;
  const callback_data = callbackQuery.data.split('|');
  const chatId = message.chat.id;
  const isFirst = callback_data[0];
  let surveyId;
  let questionId;
  let answerId;
  let isOwnAnswer;
  let thankYou;
  if (isFirst === 'true') {
    surveyId = callback_data[1];
    thankYou = callback_data[2];
  } else {
    thankYou = callback_data[1];
    questionId = callback_data[2];
    answerId = callback_data[3];
    isOwnAnswer = !!callback_data[4];
  }
  modelQuestion.getAll()
    .then(questions => {
      modelUser.getUser({ telegramId })
        .then((user) => {
          let questionsFiltered;
          if (isFirst  === 'true') {
            const survey = { survey : surveyId };
            modelUser.update({telegramId: telegramId}, survey);
            modelQuestion.getAll()
              .then(questions => {
                let questionsFiltered = questions.filter(q => q.survey === surveyId);
                questionsFiltered.forEach(q => {
                  modelAnswer.remove({question : q.id, user : user.telegramId})
                });
              })
              .then(() => {
                questionsFiltered = questions.filter(q => q.survey === surveyId);
                const opts = {
                  reply_markup: {
                    inline_keyboard: []
                  }
                };
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
                      opts.reply_markup.inline_keyboard.push([{
                        text: answer.text,
                        callback_data: `false|${thankYou}|${responseQuestion.id}|${answer.id}`,
                        resize_keyboard: true
                      }])
                    });
                    if (responseQuestion.ownAnswer.text) {
                      opts.reply_markup.inline_keyboard.push([{
                        text: responseQuestion.ownAnswer.text,
                        callback_data: `false|${thankYou}|${responseQuestion.id}|${responseQuestion.ownAnswer.id}|true`,
                        resize_keyboard: true
                      }]);
                    }
                    bot.sendMessage(chatId, responseQuestion.question, opts);
                  } else {
                    
                    const opts = {
                      reply_markup: {
                        force_reply: true,
                        
                      }
                    };
                    console.log(responseQuestion.question)
                    console.log(opts)
                    bot.sendMessage(chatId, responseQuestion.question, opts)
                  }
                } else {
                  bot.sendMessage(chatId, 'Sorry, no questions in the survey...');
                }
              })
          } else {
            const question = questions.find(q => q.id == questionId).question;
            if (isOwnAnswer) {
              const opts = {
                reply_markup: {
                  force_reply: true,
                }
              };
              bot.sendMessage(chatId, question, opts)
            } else {
              const answer = questions.find(q => q.id == questionId).answers
                .find(a => a.id == answerId).text;
              const id = uuid.v4();
              modelAnswer.create({
                id : id,
                question: questionId,
                user: user.telegramId,
                text: answer
              })
              .then(() => {
                const opts = {
                  reply_markup: {
                    inline_keyboard: []
                  }
                };
          
                modelAnswer.getByUser(telegramId)
                  .then(answers => {
                    let nextQuestion = questions.find(q => !answers.some(a => a.question == q.id) && user.survey === q.survey);
                    if (nextQuestion) {
                      if (nextQuestion.answers.length) {
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
                            callback_data: `false|${thankYou}|${nextQuestion.id}|${nextQuestion.ownAnswer.id}|true`,
                            resize_keyboard: true
                          }]);
                        }
                        bot.sendMessage(chatId, nextQuestion.question, opts);
                      }
                      else {
                        const opts = {
                          reply_markup: {
                            force_reply: true,
          
                          }
                        };
                        bot.sendMessage(chatId, nextQuestion.question, opts)
                      }
                    } else {
                      bot.sendMessage(chatId, thankYou);
                    }
                  })
              })
              
            }
          }
        })
    })
});

//start the survey, gets all options from the DB(surveys), send it to user for choosing
bot.onText(/start/, function (msg, match) {
  modelQuestion.getAll()
    .then(questions => {
      const userData = {
        date: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
        username: msg.from.username,
        telegramId: msg.from.id,
        chatId: msg.chat.id,
        answers: []
      };
  //check method after refactoring
      modelUser.getUser({telegramId: msg.from.id})
        .then(user => {
          if (user) {
            const update = {answers : [], date : moment().format('YYYY-MM-DDTHH:mm:ssZ'), survey : ''}
            modelUser.update({telegramId : msg.from.id}, update);
            //remove all users answers
            /*modelAnswer.getByUser(msg.from.id)
              .then(answers => {
                answers.forEach(answer => {
                  modelAnswer.remove({id : answer.id})
                })
              })*/

            return user.save();
          } else {
            return modelUser.create(userData);
          }
        });
    })
    .then(() =>
      modelSurvey.getAll()
        .then((surveys) => {
          const chatId = msg.chat.id;
          const reply_markup = {
            inline_keyboard: []
          };
          if (surveys.length && surveys.some(s => s.isActiveTelegram)) {
            surveys.forEach(survey => {
              if (survey.isActiveTelegram) {
                reply_markup.inline_keyboard.push([{
                  text: survey.name,
                  callback_data: `true|${survey.id}|${survey.thankYou}`,
                  resize_keyboard: true
                }]);
              }
            });
            
            const opts = {
              "parse_mode": "Markdown",
              "reply_markup": JSON.stringify(reply_markup)
            };
            
            bot.sendMessage(chatId, 'Choose language, please', opts);
          } else {
            bot.sendMessage(chatId, 'Sorry, we don\'t have any surveys yet');
          }
        })
    )
});

// Put survey to the db (surveys)
bot.onText(/add_survey: (.+)/, function (msg, match) {
  const data = match[1].split('|');
  const password = data[0];
  const name = data[1];
  const thankYou = data[2];
  const chatId = msg.chat.id;
  let stopAdding = false;
  modelSurvey.getAll()
    .then((surveys) => {
      for (let s of surveys) {
        if (s.name == name) {
          stopAdding = true;
        }
      }
      if (stopAdding) {
        bot.sendMessage(chatId, `This survey already exists!`);
      } else {
        if (password === PASSWORD) {
          // action.createSurvey(name, thankYou)
          const data = {};
          data.id = uuid.v4();
          data.name = name;
          data.thankYou = thankYou;
          modelSurvey.create(data)
            .then(() => bot.sendMessage(chatId, `Survey added!`));
        } else {
          bot.sendMessage(chatId, `Wrong password!`)
        }
      }
    });
});

// Put question to the db (questions)
bot.onText(/add_question: (.+)/, function (msg, match) {
  const data = match[1].split('|');
  const password = data[0];
  const survey = data[1];
  const question = data[2];
  const questionitself = question.split('{')[0];
  const ownAnswer = data[3];
  const chatId = msg.chat.id;
  let stopAdding = false;
  let questionsQuantity = 0;
  let stopMessage = '';
  let surveyId = '';
  modelSurvey.getAll()
    .then((surveys) => {
      if (!surveys.some(s => s.name === survey)) {
        stopAdding = true;
        stopMessage = `This survey didn't find!`;
      } else {
        surveyId = surveys.find(s => s.name === survey).id;
      }
      action.getQuestions()
        .then((questions) => {
          for (let q of questions) {
            if (q.survey === surveyId) {
              questionsQuantity++;
            }
            if (q.question == questionitself) {
              stopAdding = true;
              stopMessage = `This question already exists!`;
            }
          }
          if (stopAdding) {
            bot.sendMessage(chatId, stopMessage);
          } else {
            if (password === PASSWORD) {
              action.createQuestion(surveyId, question, ownAnswer, questionsQuantity)
                .then(() => {
                  action.initializeAddedQuestionUserAnswers(surveyId)
                    .then(() => {
                      bot.sendMessage(chatId, `Question added!`);
                    })
                })
            } else {
              bot.sendMessage(chatId, `Wrong password!`)
            }
          }
        });
    });
});

// Remove all questions from the db(questions) with survey = the name and remove survey with the name from the db(surveys)
bot.onText(/remove_survey: (.+)/, function (msg, match) {
  const data = match[1].split('|');
  const password = data[0];
  const name = data[1];
  const chatId = msg.chat.id;
  modelSurvey.getAll()
    .then((surveys) => {
      if (password !== PASSWORD) {
        bot.sendMessage(chatId, `Wrong password!`)
      } else if (surveys.some(survey => survey.name === name)) {
        action.removeSurvey(name).then(() => bot.sendMessage(chatId, `The survey was deleted!`));
      } else {
        bot.sendMessage(chatId, `There are no surveys with this name in db!`)
      }
    });
});

//Send all unanswered questions and added afterwards to all users have ever participated, looks for users, who has unanswered question,
// takes them, checks survey in them and sends first unanswered question, excerpt 'deleted'
bot.onText(/send (.+)/, function (msg, match) {
  const password = match[1];
  const chatId = msg.chat.id;
  if (password === PASSWORD) {
    action.getUsers()
      .then((users) => {
        let unfinishedUsers = [];
        for (let user of users) {
          let unfinish = false;
          for (let answer of user.answers) {
            if (!answer.answer && !answer.isDeleted) {
              unfinish = true
            }
          }
          if (unfinish) {
            unfinishedUsers.push(user);
          }
        }
        if (unfinishedUsers.length) {
          action.getQuestions()
            .then((questions) => {
              modelSurvey.getAll()
                .then((surveys) => {
                  let j;
                  const sendInterval = setInterval(function () {
                    if (j === undefined) j = 0;
                    let user = unfinishedUsers[j];
                    user.answers = user.answers.filter(a => !a.isDeleted);
                    user.answers.sort((a, b) => {
                      return questions.find(q => q.id === a.questionId).index -
                        questions.find(q => q.id === b.questionId).index
                    });
                    if (surveys.find((survey) => survey.id === user.survey)) {
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
                        bot.sendMessage(user.chatId, nextQuestion.question, opts);
                      } else {
                        const opts = {
                          reply_markup: {
                            force_reply: true,
                          }
                        };
                        bot.sendMessage(user.chatId, nextQuestion.question, opts);
                      }
                      j++;
                      if (j === unfinishedUsers.length) clearInterval(sendInterval);
                    }
                  }, 50);
                });
            });
          bot.sendMessage(chatId, `Sent successfully!`);
        } else {
          bot.sendMessage(chatId, `No users with unanswered questions!`);
        }
      });
  } else {
    bot.sendMessage(chatId, `Wrong password!`)
  }
});

//Export to google spreadsheet, takes data from the DBs(users, questions, surveys), add new sheet if needed, sort data and write it on the sheets
bot.onText(/google (.+)/, function (msg, match) {
  const password = match[1];
  const chatId = msg.chat.id;
  if (password === PASSWORD) {
    action.getAllQuestions()
      .then((questions) => {
        action.getUsers()
          .then((users) => {
            modelSurvey.getAll()
              .then((surveys) => {
                postSpreadSheets(questions, users, surveys);
                bot.sendMessage(chatId, `Migration complete!`)
              });
          });
      });
  } else {
    bot.sendMessage(chatId, `Wrong password!`)
  }
});