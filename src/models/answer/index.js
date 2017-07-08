import mongoose from 'mongoose';

import Model from '../model';

const ObjectIdSchema = mongoose.Schema.ObjectId;
const ObjectId = mongoose.Types.ObjectId;

export const AnswerSchema = new mongoose.Schema({
  id: {type: String, default: ''},
  question: {type: String},
  user: {type: String},
  text: {type: String, default: ''},
  isDeleted: {type: Boolean, default: false}
});

AnswerSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
  },
});

const Answer = mongoose.model('Answer', AnswerSchema);

/**
 * Service level class with methods for answers.
 */
export default class AnswerModel {
  constructor() {
    this.model = new Model(Answer);
  }
  
  create(answer) {
    return this.model.create(answer);
  }
  
  getByUser(userId) {
    const criteria = {
      user: userId
    };
    return this.model.select(criteria);
  }
  
  update(criteria, update) {
    return this.model.update(criteria, update);
  }

  remove(criteria) {
      return this.model.remove(criteria);
    }
}
