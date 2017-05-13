
import Service from '../service';
import SurveyModel from '../../models/survey';

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
                    res.status(400).send(error.message || error);
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
        // req.assert('password', 'required').notEmpty();
        // req.assert('password', '6 to 20 characters required').len(6, 20);
        // req.assert('email', 'valid email required').isEmail();
        // req.assert('email', 'required').notEmpty();
        // this.validation(req);
        
        
        return (
          this.model.create(req.body)
                .then(() => {
                    res.status(200).send("Survey created");
                })
                .catch(error => {
                    res.status(400).send(error.message || error);
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
        // req.assert('password', 'required').notEmpty();
        // req.assert('password', '6 to 20 characters required').len(6, 20);
        // req.assert('email', 'valid email required').isEmail();
        // req.assert('email', 'required').notEmpty();
        // this.validation(req);


        return (
          this.model.update(req.body)
                .then(() => {
                    res.status(200).send("Survey updated");
                })
                .catch(error => {
                    res.status(400).send(error.message || error);
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
        // req.assert('password', 'required').notEmpty();
        // req.assert('password', '6 to 20 characters required').len(6, 20);
        // req.assert('email', 'valid email required').isEmail();
        // req.assert('email', 'required').notEmpty();
        // this.validation(req);
        
        
        return (
          this.model.remove(req.body.id)
                .then(() => {
                    res.status(200).send("Survey deleted");
                })
                .catch(error => {
                    res.status(400).send(error.message || error);
                }))
    };
}