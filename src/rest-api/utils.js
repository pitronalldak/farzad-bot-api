import { Router } from 'express';

let api = Router();

export class Service {
    constructor(handler) {
    }

    // Generic GET handler;
    GET(url, handler) {
        app.get(url, (req, res) => {
            handler(req)
                .then(data => {
                    res.json({
                        success: true,
                        data
                    });
                })
                .catch(error => {
                    res.json({
                        success: false,
                        error: error.message || error
                    });
                });
        });
    };

    // Generic GET handler;
    POST(url, handler) {
        app.post(url, (req, res) => {
            handler(req)
                .then(data => {
                    res.json({
                        success: true,
                        data
                    });
                })
                .catch(error => {
                    res.json({
                        success: false,
                        error: error.message || error
                    });
                });
        });
    };

}
