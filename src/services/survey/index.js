import Service from '../service';
import SurveyModel from '../../models/survey';
import uuid from 'uuid/v4';

/**
 * Service level class with methods for surveys.
 */
export default class SurveyService extends Service {
    constructor(dao) {
        super();
        this.model = new SurveyModel();
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
     * Method for create survey .
     *
     * @param {String} req request from client
     * @param {String} res response to client
     * @return {Promise} promise
     */
    create(req, res) {
    
        const id = uuid.v4();
        req.body.id = id;
        return (
            this.model.create(req.body)
                .then(() => {
                    res.json({id});
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