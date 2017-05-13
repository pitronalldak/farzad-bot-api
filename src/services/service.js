var util = require('util');

export default class Service {

    validation = (req) => {
        req.getValidationResult()
            .then((error) => {
                if (!error.isEmpty()) {
                    return res.status(400).send('There have been validation errors: ' + util.inspect(error.array()));
                }
            })
    }
}