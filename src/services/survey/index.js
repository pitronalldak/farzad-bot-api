import Service from '../service';
import SurveyModel from '../../models/survey';
import QuestionModel from '../../models/question';
import UserModel from '../../models/user';
const uuidV4 = require('uuid/v4');
const { postSpreadSheets } = require('../google-spreadsheets');

/**
 * Service level class with methods for surveys.
 */
export default class SurveyService extends Service {
    constructor(dao) {
        super();
        this.model = new SurveyModel();
        this.modelQuestion = new QuestionModel();
        this.modelUser = new UserModel();
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
                this.modelUser.getAll()
                ])
                 .then(response => {
                     const surveys = response[0];
                     const questions = response[1];
                     const users = response[2];
                     postSpreadSheets(questions, users, surveys);
                     res.status(200).send(JSON.stringify({msg: "Migration complete"}));
                 })
                .catch(error => {
                    res.status(400).send(JSON.stringify({err: error.message || error}));
                }))
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
                    res.status(200).send(JSON.stringify({msg: "Survey deleted"}));
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
     * Method for activate survey .
     *
     * @param {String} req request from client
     * @param {String} res response to client
     * @return {Promise} promise
     */
    activate(req, res) {
        
        return (
            this.model.activate(req.body)
                .then(() => {
                    res.status(200).send(JSON.stringify({msg: "Survey status changed"}));
                })
                .catch(error => {
                    res.status(400).send(JSON.stringify({err: error.message || error}));
                }))
    };
}