const uuidV4 = require('uuid/v4');
import getHash from './pass';
import Service from '../service';
import UserModel from '../../models/user';

/**
 * Service level class with methods for authorization.
 */
export default class UserService extends Service {
    constructor() {
        super();
        this.model = new UserModel();
    }


    /**
     * Method for creating new user.
     *
     * @param {String} req request from client
     * @param {String} res response to client
     * @return {Promise} promise
     */
    createUser(req, res) {
        // req.assert('email', 'required').notEmpty();
        // req.assert('email', 'valid email required').isEmail();
        // req.assert('password', 'required').notEmpty();
        // req.assert('password', '6 to 20 characters required').len(6, 20);
        // req.assert('userName', 'required').notEmpty();
        // req.assert('location', 'required').notEmpty();
        // req.assert('phone', 'required').notEmpty();
        // this.validation(req);

        //generate a salt for  and new password for db
        const salt = crypto.randomBytes(64).toString('base64');
        const password = getHash(req.body.password, salt);
        req.body.salt = salt;
        req.body.password = password;
        return (
            this.dao.createUser(req.body)
                .then(data => {
                    res.json({
                        success: true,
                        data
                    });
                })
                .catch(error => {
                    res.status(400).send(error.message || error);
                }))
    };

    /**
     * Method for user login.
     *
     * @param {String} req request from client
     * @param {String} res response to client
     * @return {Promise} promise
     */
    login(req, res) {
        
        return (
            this.model.getUserBO({email: req.body.email})
                .then(user => {
                    if (!user) {
                        res.status(400).send(JSON.stringify({err: "User doesn't exist"}));
                    } else {
                        if (user.password === req.body.password) {
                            delete user.password;
                            const accessToken = uuidV4();
                            this.model.updateUserBO({email: req.body.email}, {accessToken})
                                .then(() => {
                                    res.cookie('accessToken', accessToken, { maxAge: 9000000, httpOnly: true });
                                    res.json({user});
                                })
                        } else {
                            res.status(400).send(JSON.stringify({err: "Invalid password"}));
                        }
                    }
                })
                .catch(error => {
                    res.status(400).send(error.message || error);
                }))
    };
    
    /**
     * Method for user logout.
     *
     * @param {String} req request from client
     * @param {String} res response to client
     * @return {Promise} promise
     */
    logout(req, res) {
        const accessToken = req.cookies.accessToken;
        return (
            this.model.updateUserBO({accessToken: req.body.accessToken}, {accessToken: null})
                .then(data => {
                    res.status(200).send(JSON.stringify({msg: "Logout success"}));
                })
                .catch(error => {
                    res.status(400).send(error.message || error);
                }))
    };
    
    /**
     * Method for get user info.
     *
     * @param {String} req request from client
     * @param {String} res response to client
     * @return {Promise} promise
     */
    getUser(req, res) {
        const accessToken = req.cookies.accessToken;
        console.log(req.cookies.accessToken);
        console.log(req.cookies);
        console.log(req.headers.cookie);
        
        if (!accessToken) {
            res.status(401).send(JSON.stringify({err: "Not authorize"}));
        }
        return (
            this.model.getUserBO({accessToken: req.body.accessToken})
                .then(user => {
                    if (!user) {
                        res.status(401).send(JSON.stringify({err: "Not authorize"}));
                    } else {
                        res.json({email: user.email});
                    }
                })
                .catch(error => {
                    res.status(400).send(error.message || error);
                })
            );
    };
}