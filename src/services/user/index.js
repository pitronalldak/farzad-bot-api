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
            this.model.updateUserBO({accessToken}, {accessToken: null})
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
    getUserBO(req, res) {
        const accessToken = req.cookies.accessToken;
        
        if (!accessToken) {
            res.status(401).send(JSON.stringify({err: "Not authorize"}));
        }
        return (
            this.model.getUserBO({accessToken})
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