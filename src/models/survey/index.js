import mongoose from 'mongoose';

import Model from '../model';

const ObjectIdSchema = mongoose.Schema.ObjectId;
const ObjectId = mongoose.Types.ObjectId;


export const SurveySchema = new mongoose.Schema({
    id: { type: String, default: '' },
    name: { type : String, default : '' },
    thankYou: { type : String, default : '' },
    isActiveTelegram: { type : Boolean, default : false },
    isActiveFacebook: { type : Boolean, default : false }
});


SurveySchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
  },
});

const Survey = mongoose.model('Survey', SurveySchema);

/**
 * Service level class with methods for surveys.
 */
export default class SurveyModel {
    constructor() {
      this.model = new Model(Survey);
    }
    
    getAll() {
        return this.model.select({});
    }
    
    create(survey) {
        return this.model.create(survey);
    }
    
    update(survey) {
        const criteria = {id: survey.id};
        delete survey.id;
        
        const update = survey;
        return this.model.update(criteria, update);
    }
    
    remove(id) {
        const criteria = {id};
        return this.model.remove(criteria);
    }
  
    activateFacebook(data) {
        const criteria = {id: data.id};
        const update = {isActiveFacebook: data.isActiveFacebook};
        return this.model.update(criteria, update);
    }
  
    activateTelegram(data) {
        const criteria = {id: data.id};
        const update = {isActiveTelegram: data.isActiveTelegram};
        return this.model.update(criteria, update);
    }
    
}

