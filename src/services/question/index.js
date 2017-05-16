import Service from '../service';
import QuestionModel from '../../models/question';
import uuid from 'uuid/v4';

/**
 * Service level class with methods for questions.
 */
export default class QuestionService extends Service {
    constructor() {
        super();
        this.model = new QuestionModel();
    }
    
    /**
     * Method for request all questions.
     *
     * @param {String} req request from client
     * @param {String} res response to client
     * @return {Promise} promise
     */
    getAll(req, res) {
        
        return (
            this.model.getAll(req.body)
                .then(data => {
                    res.json({data});
                })
                .catch(error => {
                    res.status(400).send(JSON.stringify({err: error.message || error}));
                }))
    };
    
    /**
     * Method for create question .
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
     * Method for update question .
     *
     * @param {String} req request from client
     * @param {String} res response to client
     * @return {Promise} promise
     */
    update(req, res) {
        // req.assert('password', 'required').notEmpty();
        // req.assert('password', '6 to 20 characters required').len(6, 20);
        // req.assert('email', 'valid email required').isEmail();
        // req.assert('email', 'required').notEmpty();
        // this.validation(req);
        
        
        return (
            this.model.update(req.body)
                .then(() => {
                    res.status(200).send(JSON.stringify({msg: "Question updated"}));
                })
                .catch(error => {
                    res.status(400).send(JSON.stringify({err: error.message || error}));
                }))
    };
    
    /**
     * Method for delete question .
     *
     * @param {String} req request from client
     * @param {String} res response to client
     * @return {Promise} promise
     */
    remove(req, res) {
        // req.assert('password', 'required').notEmpty();
        // req.assert('password', '6 to 20 characters required').len(6, 20);
        // req.assert('email', 'valid email required').isEmail();
        // req.assert('email', 'required').notEmpty();
        // this.validation(req);
        
        
        return (
            this.model.remove(req.body.id)
                .then(() => {
                    res.status(200).send(JSON.stringify({msg: "Question deleted"}));
                })
                .catch(error => {
                    res.status(400).send(JSON.stringify({err: error.message || error}));
                }))
    };
    
    /**
     * Method for request questions order.
     *
     * @param {String} req request from client
     * @param {String} res response to client
     * @return {Promise} promise
     */
    getOrder(req, res) {
        
        return (
            this.model.getOrder(req.body.surveyId)
                .then(data => {
                    res.json({data});
                })
                .catch(error => {
                    res.status(400).send(JSON.stringify({err: error.message || error}));
                }))
    };
    
    /**
     * Method for request questions order.
     *
     * @param {String} req request from client
     * @param {String} res response to client
     * @return {Promise} promise
     */
    updateOrder(req, res) {
        
        return (
            this.model.updateOrder(req.body)
                .then(() => {
                    res.status(200).send(JSON.stringify({msg: "Order updated"}));
                })
                .catch(error => {
                    res.status(400).send(JSON.stringify({err: error.message || error}));
                }))
    };
}