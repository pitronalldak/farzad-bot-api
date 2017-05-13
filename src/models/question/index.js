import mongoose from 'mongoose';

import Model from '../model';

const Schema = mongoose.Schema;
const ObjectIdSchema = Schema.ObjectId;
const ObjectId = mongoose.Types.ObjectId;

const QuestionSchema = new Schema({
    id: { type: String, default: '' },
    survey: { type : String },
    question: { type : String, default : ''},
    answers: { type : [] },
    ownAnswer: {
        id: { type: String, default: '' },
        text: { type: String, default: '' }
    }
});

/**
 * Service level class with methods for questions.
 */
export default class QuestionModel extends Model {
    constructor() {
        super();
    }
    
    static getAll() {
        return super.select({});
    }
    
    static create(question) {
        return super.create(question);
    }
    
    static update(question) {
        const criteria = {id: survey.id};
        delete question.id;
        
        const update = question;
        return super.update(criteria, update);
    }
    
    static remove(id) {
        const criteria = {id};
        return super.remove(criteria);
    }
}

mongoose.model('Question', QuestionSchema);
