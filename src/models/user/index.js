const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectIdSchema = Schema.ObjectId;
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

UserSchema.statics = {
  
  /**
   * List questions
   *
   * @param {Object} telegramId
   * @api private
   */
  
  getUserById: function (telegramId) {
    return this.findOne({telegramId})
      .exec();
  },
  list: function (options) {
    return this.find()
      .exec();
  }
};

mongoose.model('User', UserSchema);