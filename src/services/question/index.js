import Service from '../service';
import QuestionModel from '../../models/question';

/**
 * Service level class with methods for questions.
 */
export default class QuestionService extends Service {
    constructor(dao) {
        super();
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
            QuestionModel.getAll()
                .then(data => {
                    res.json({data});
                })
                .catch(error => {
                    res.status(400).send(error.message || error);
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
        // req.assert('password', 'required').notEmpty();
        // req.assert('password', '6 to 20 characters required').len(6, 20);
        // req.assert('email', 'valid email required').isEmail();
        // req.assert('email', 'required').notEmpty();
        // this.validation(req);
        
        
        return (
            QuestionModel.create(req.body)
                .then(() => {
                    res.status(200).send("Question created");
                })
                .catch(error => {
                    res.status(400).send(error.message || error);
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
            QuestionModel.update(req.body)
                .then(() => {
                    res.status(200).send("Question updated");
                })
                .catch(error => {
                    res.status(400).send(error.message || error);
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
            QuestionModel.remove(req.body.id)
                .then(() => {
                    res.status(200).send("Question deleted");
                })
                .catch(error => {
                    res.status(400).send(error.message || error);
                }))
    };
}