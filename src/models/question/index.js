import mongoose from 'mongoose';

import Model from '../model';

const ObjectIdSchema = mongoose.Schema.ObjectId;
const ObjectId = mongoose.Types.ObjectId;

const QuestionSchema = new mongoose.Schema({
    id: { type: String, default: '' },
    survey: { type : String },
    type: { type : String, default : 'ownAndOptions' },
    question: { type : String, default : ''},
    answers: { type : [] },
    ownAnswer: {
        id: { type: String, default: '' },
        text: { type: String, default: '' }
    }
});

QuestionSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
  },
});

const Question = mongoose.model('Question', QuestionSchema);

/**
 * Service level class with methods for questions.
 */
export default class QuestionModel {
    constructor() {
        this.model = new Model(Question);
    }
    
    getAll() {
        return this.model.select({});
    }
    
    create(question) {
        return this.model.create(question);
    }
    
    update(question) {
        const criteria = {id: question.id};
        delete question.id;
        
        const update = question;
        return this.model.update(criteria, update);
    }
    
    remove(id) {
        const criteria = {id};
        return this.model.remove(criteria);
    }
}
