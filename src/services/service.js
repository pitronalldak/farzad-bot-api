var util = require('util');
import uuid from 'node-uuid';
import UserBOModel from '../models/user';

export default class Service {
    
    constructor() {
        this.model = new UserBOModel();
    }
    
    validation = (req) => {
        req.getValidationResult()
            .then((error) => {
                if (!error.isEmpty()) {
                    return res.status(400).send('There have been validation errors: ' + util.inspect(error.array()));
                }
            })
    };
    
    validateSession =(req, res) => {
        let accessToken = req.cookies.accessToken;
        
        if (!accessToken) {
            res.status(400).send("Invalid password");
        }
    
        this.model.get({accessToken: req.body.accessToken})
            .then(user => {
                if (!user) {
                    res.status(401);
                } else {
                    return user;
                }
        });
    };
}

