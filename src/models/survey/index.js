import mongoose from 'mongoose';

import Model from '../model';

const Schema = mongoose.Schema;
const ObjectIdSchema = Schema.ObjectId;
const ObjectId = mongoose.Types.ObjectId;


const SurveySchema = new Schema({
    id: { type: String, default: '' },
    name: { type : String, default : '' },
    thankYou: { type : String, default : '' }
});

/**
 * Service level class with methods for surveys.
 */
export default class SurveyModel extends Model {
    constructor(dao) {
        super();
    }
    
    static getAll() {
        return super.select({});
    }
    
    static create(survey) {
        return super.create(survey);
    }
    
    static update(survey) {
        const criteria = {id: survey.id};
        delete survey.id;
        
        const update = survey;
        return super.update(criteria, update);
    }
    
    static remove(id) {
        const criteria = {id};
        return super.remove(criteria);
    }
}

mongoose.model('Survey', SurveySchema);
